/**
 * 智谱AI服务 - GLM大模型API调用
 * 
 * API调用基本概念：
 * 1. API Key: 你的身份凭证，证明你有权限使用智谱AI服务
 * 2. HTTP请求: 向智谱AI服务器发送数据和指令
 * 3. 响应: 智谱AI返回的结果
 */

// 智谱AI API 配置
const ZHIPU_API_BASE = 'https://open.bigmodel.cn/api/paas/v4';
const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || ''; // 你需要设置这个环境变量

/**
 * 智谱AI API调用接口
 * 
 * 这个函数的作用：
 * 1. 接收你的问题（prompt）
 * 2. 发送HTTP请求到智谱AI服务器
 * 3. 返回AI生成的回答
 */
export async function callZhipuAPI(prompt: string, options: {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  retries?: number;
} = {}) {
  
  // 检查API Key是否存在
  if (!ZHIPU_API_KEY) {
    console.warn('智谱AI API Key未配置，将使用随机数据库');
    throw new Error('ZHIPU_API_KEY_NOT_CONFIGURED');
  }

  // 准备请求数据
  const requestData = {
    model: options.model || 'glm-4-plus',  // 使用的模型版本
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: options.temperature || 0.7,  // 创造性程度 (0-1)
    max_tokens: options.max_tokens || 1000    // 最大回复长度
  };

  const maxRetries = options.retries || 2;
  let lastError: Error | null = null;

  // 重试机制
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // 如果是重试，添加延迟
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        console.log(`智谱AI API重试第${attempt}次...`);
      }

      // 发送HTTP请求到智谱AI
      const response = await fetch(`${ZHIPU_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ZHIPU_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(30000) // 30秒超时
      });

      // 检查请求是否成功
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        
        // 某些错误不需要重试
        if (response.status === 401 || response.status === 403) {
          throw new Error(`API认证失败: ${errorMessage}`);
        }
        
        throw new Error(`智谱AI API调用失败: ${errorMessage}`);
      }

      // 解析返回的数据
      const data = await response.json();
      
      // 验证响应格式
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('API返回格式异常');
      }
      
      // 返回AI生成的内容
      return {
        success: true,
        content: data.choices[0].message.content || '',
        usage: data.usage || {},
        model: data.model || requestData.model
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('未知错误');
      console.warn(`智谱AI API调用失败 (尝试${attempt + 1}/${maxRetries + 1}):`, lastError.message);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        break;
      }
    }
  }

  // 所有重试都失败了
  return {
    success: false,
    error: lastError?.message || '未知错误',
    content: ''
  };
}

/**
 * 生成八字解读 - 使用智谱AI
 */
export async function generateBaziInterpretation(baziData: any, formData: any) {
  const prompt = `
你是一位温和智慧的女性主义命理师，请根据以下八字信息生成个性化解读。

基本信息：
- 出生时间：${formData.year}年${formData.month}月${formData.day}日${formData.hour}时
- 八字数据：${JSON.stringify(baziData, null, 2)}

请用积极、现代、女性主义的语言风格，避免传统命理中的消极表述。每个方面都要个性化，不要使用通用模板。

财运模块计算说明：
1. 原局财气值 (native_score)：计算八字中"财"的绝对数量与质量，基准分10分，上限60分
2. 身财平衡系数：判断日主能否驾驭财富，修正"富屋贫人"现象
3. 2026流年能量 (yearly_luck_score)：2026丙午年（火旺）与日主五行的化学反应，满分40分
   - 修正：地支见子（鼠）扣10分（子午冲），地支见未（羊）加5分（午未合）
4. 总分 = (原局财气值 × 身财平衡系数) + 流年能量，范围限制在40-99分
5. 财富雷达：计算五维能力（爆发力、持久力、稳定性、流动性、增长性），每项分数范围60-98分
6. 开运罗盘：计算财位五行（日主所克之五行），若无财则取喜用神五行，匹配方位、物品、行为建议

财运模块算法说明：
1.1 模块一：财运总览 (Wealth Overview)
目标：解决“身弱财旺”误判问题，精准量化 2026 年流年运势。
核心公式：
$$TotalScore = (NativeScore \times BalanceMultiplier) + YearlyLuckScore$$
(结果范围限制：40 - 99 分)
1.1 第一层：原局财气值 (Native Score)
逻辑：计算八字中“财”的绝对数量与质量。
基准分：10分。
上限：60分。
| 检查项     | 细分规则      | 分值       | 逻辑说明           |
| ------- | --------- | -------- | -------------- |
| A. 天干透财 | 正财透出      | 10 分（每个） | 显性财富（工资、现金流）   |
|         | 偏财透出      | 15 分（每个） | 流动财富（投资、奖金）    |
| B. 地支藏财 | 主气为财      | 20 分（每个） | 财库深厚（不动产、长期积蓄） |
|         | 余气为财      | 8 分（每个）  | 隐性或小规模财富       |
| C. 财源   | 食神 / 伤官生财 | 15 分     | 有稳定或可复制的赚钱能力   |
| D. 兜底规则 | 从儿 / 从旺格  | 固定 50 分  | 防止特殊格局被低估      |

1.2 第二层：身财平衡系数 (Balance Multiplier)
逻辑：修正“富屋贫人”现象，判断日主能否驾驭财富。
| 组合场景    | 修正系数 | 业务解读         |
| ------- | ---- | ------------ |
| 身强 + 财旺 | 1.2  | 富贵双全，能力与机会匹配 |
| 身弱 + 财旺 | 0.6  | 富屋贫人，财多反成负担  |
| 身强 + 财弱 | 0.8  | 有能力但缺风口      |
| 身弱 + 财弱 | 1.0  | 平稳人生，无大起落    |

1.3 第三层：2026 流年能量 (Yearly Luck)
逻辑：2026 丙午年（火旺）与日主五行的化学反应。
满分：40分。
| 用户日主     | 2026 角色 | 基础分区间 | 核心判断逻辑           |
| -------- | ------- | ----- | ---------------- |
| 水（壬 / 癸） | 财星      | 30–40 | 水克火为财，机会主动找上门    |
| 金（庚 / 辛） | 官杀      | 20–30 | 压力换资源，升职但高消耗     |
| 土（戊 / 己） | 印星      | 25–35 | 火生土，资产沉淀、适合配置不动产 |
| 木（甲 / 乙） | 食伤      | 20–30 | 才华输出强，但支出与风险高    |
| 火（丙 / 丁） | 比劫      | 10–25 | 高竞争；身弱得助、身强反夺财   |

修正补丁：
- 地支见子（鼠）：流年分 扣 10 分 (子午冲)。
- 地支见未（羊）：流年分 加 5 分 (午未合)。

---
1.2 模块二：财富雷达 (The Wealth Radar)
目标：通过双因子校验，生成五维能力图。
计算逻辑：
$$DimScore = (Primary \times 0.7) + (Secondary \times 0.3)$$
(Normalization: 最低 60 分，最高 98 分)
| 雷达维度                | 主导因子 (Primary) | 辅助 / 修正因子 (Secondary) | 文案生成 Nuance             |
| ------------------- | -------------- | --------------------- | ----------------------- |
| 1. 爆发力 (Windfall)   | 偏财（机会 / 横财）    | 七杀（魄力 / 杠杆）           | 仅偏财无杀：有机会但不敢上；双旺：天生狙击手  |
| 2. 持久力 (Endurance)  | 正财（稳定流）        | 正官（体系 / 自律）           | 仅正财无官：勤劳但零散；双旺：长期主义者    |
| 3. 抗风险 (Defense)    | 财库（辰戌丑未）       | 印星（兜底 / 房产）           | 无库有印：留不住钱但有人托底；双全：抗金融危机 |
| 4. 贵人运 (Nobleman)   | 天乙 / 天德        | 印星（长辈 / 平台）           | 无印有神煞：靠运气；印旺：自带团宠光环     |
| 5. 变现率 (Conversion) | 食神 / 伤官        | 日主强弱（承载力）             | 食伤旺身弱：想法多落地难；双旺：印钞机     |


---
1.3 模块三：开运罗盘 (Actionable Feng Shui)
目标：提供“方位 + 物品 + 行为习惯”的闭环建议。
核心算法：
1. 计算财位五行（日主所克之五行）。
2. 若无财，取喜用神五行。
3. 匹配下表输出。
| 财位五行      | 核心关键词   | 方位      | 物品建议（Physical） | 行为建议（SOP / Behavior） |
| --------- | ------- | ------- | -------------- | -------------------- |
| 金 (Metal) | 秩序 / 决断 | 西 / 西北  | 金属摆件、保险柜、机械键盘  | 建立 SOP、记账、断舍离        |
| 木 (Wood)  | 生长 / 链接 | 东 / 东南  | 发财树、书籍、木质香氛    | 拓展社交、学习新技能           |
| 水 (Water) | 流动 / 智慧 | 正北      | 鱼缸、加湿器、钢笔      | 复盘逻辑、数据分析、多沟通        |
| 火 (Fire)  | 表达 / 显化 | 正南      | 氛围灯、红色装饰、电子设备  | 打造人设、展示成果            |
| 土 (Earth) | 积累 / 信用 | 东北 / 西南 | 陶瓷、石头、黄水晶      | 长期定投、减少无效社交          |

财富等级说明：
A6级别（10万-50万）：温饱与生活小康的起始点，具备基础生活消费能力。
A7级别（100万-500万）：资产百万级别，标志着从基础温饱步入小康，在三四线城市生活较舒适。
A8级别（1000万-5000万）：资产千万级别，通常视为房地产投资圈财务自由的初步门槛，属于中产阶级的高端。
A9级别（1亿-10亿）：资产过亿，属于高净值人群，甚至“准富豪”。
A10及以上（10亿+）：大资本家、企业家或顶级富豪阶层

请严格按照以下JSON格式返回，不要添加任何其他文字：

{
  "personality": "性格特点分析，体现独特个性，100-150字",
  "career": "事业发展建议，结合现代职场，100-150字", 
  "love": "感情运势，现代情感观念，100-150字",
  "advice": "今日行动建议，具体可执行，80-120字",
  "luckyColor": "一个具体的颜色名称",
  "vitamin": "今日能量补充建议，如'多巴胺森林漫步'",
  "elementBalance": "五行平衡状态描述",
  "wealth": {
    "title": "今日财运主题，简洁有吸引力",
    "advice": "财运分析和具体建议，包含可执行的理财行动，120-180字",
    "luckyDirection": "有利的方位，如'东南方'",
    "luckyTime": "最佳理财决策时间段，如'14:00-16:00'",
    "suggestion": "具体的理财行动建议，如'适合定投基金'"
  },
  "health": {
    "morning": {
      "action": "晨间养生活动，具体可执行，如'饮一杯温润的茉莉花茶'",
      "benefit": "这个活动的好处和效果，50-80字"
    },
    "flow": {
      "action": "心流时刻活动，具体可执行，如'冥想与自然白噪音'",
      "benefit": "这个活动的好处和最佳时间，50-80字，包含具体时间段"
    }
  },
  "user_profile": {
    "day_master": "日主天干，如'甲'、'乙'等",
    "strength": "身强或身弱，值为'strong'或'weak'",
    "wealth_element": "财的五行，如'土'、'金'等"
  },
  "modules": {
    "overview": {
      "total_score": 根据财运模块计算说明计算,
      "tier": 根据total_score匹配对应的财富等级(A6-A10), 详见财富等级说明, 语言诙谐,如A6小康家, A9小富婆,
      "tier_tag": "根据total_score匹配",
      "native_score": 根据财运模块计算说明计算,
      "yearly_luck_score": 根据财运模块计算说明计算,
      "comment": "根据total_score和tier_tag生成评论"
    },
    "radar": [
      { "subject": "爆发力", "score": 根据财运模块计算说明计算, "analysis": "根据计算结果和相应模块里的细分规则生成分析" },
      { "subject": "持久力", "score": 根据财运模块计算说明计算, "analysis": "根据计算结果和相应模块里的细分规则生成分析" },
      { "subject": "稳定性", "score": 根据财运模块计算说明计算, "analysis": "根据计算结果和相应模块里的细分规则生成分析" },
      { "subject": "流动性", "score": 根据财运模块计算说明计算, "analysis": "根据计算结果和相应模块里的细分规则生成分析" },
      { "subject": "增长性", "score": 根据财运模块计算说明计算, "analysis": "根据计算结果和相应模块里的细分规则生成分析" }
    ],
    "compass": {
      "direction": "根据财运模块计算说明计算",
      "element": "根据财运模块计算说明计算",
      "lucky_item": "根据财运模块计算说明计算",
      "action_sop": "根据财运模块计算说明计算"
    }
  }
}

重要要求：
1. 语言现代化，避免"克夫"、"命硬"等传统负面词汇
2. 建议要实用，符合现代生活
3. 保持积极正面的基调，解析个体特质，强调主体性
4. 内容要有个性化差异，不要千篇一律
5. 严格遵循JSON格式，确保可以被解析
`;

  try {
    const result = await callZhipuAPI(prompt, {
      model: 'glm-4-plus',
      temperature: 0.8,
      max_tokens: 3500,
      retries: 2
    });

    if (result.success && result.content) {
      try {
        // 清理可能的格式问题
        let cleanContent = result.content.trim();
        
        // 移除可能的markdown代码块标记
        cleanContent = cleanContent.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        
        // 移除可能的说明文字（在JSON之前或之后）
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanContent = jsonMatch[0];
        }
        
        // 尝试解析JSON
        const interpretation = JSON.parse(cleanContent);
        
        // 验证必要字段
        if (interpretation.personality && interpretation.career && interpretation.wealth && interpretation.health) {
          // 验证wealth和health的嵌套结构
          if (!interpretation.wealth.title || !interpretation.wealth.advice) {
            throw new Error('wealth字段格式不正确，需要包含title和advice');
          }
          if (!interpretation.health.morning || !interpretation.health.flow) {
            throw new Error('health字段格式不正确，需要包含morning和flow');
          }
          // 验证财运模块（可选，如果存在则验证格式）
          if (interpretation.modules) {
            if (interpretation.modules.overview && typeof interpretation.modules.overview.total_score !== 'number') {
              console.warn('财运总览模块格式可能不完整');
            }
            if (interpretation.modules.radar && !Array.isArray(interpretation.modules.radar)) {
              console.warn('财富雷达模块格式可能不完整');
            }
            if (interpretation.modules.compass && !interpretation.modules.compass.direction) {
              console.warn('开运罗盘模块格式可能不完整');
            }
          }
          
          console.log('✅ 智谱AI八字解读生成成功');
          // 输出API返回的完整内容到控制台
          console.log('📊 API返回的完整数据:', JSON.stringify(interpretation, null, 2));
          return {
            ...interpretation,
            source: 'ai',
            model: result.model
          };
        } else {
          throw new Error('AI返回的JSON缺少必要字段');
        }
      } catch (parseError) {
        console.error('解析智谱AI响应失败:', parseError);
        console.log('原始响应:', result.content);
        throw new Error('AI响应格式错误');
      }
    } else {
      throw new Error(result.error || 'AI调用失败');
    }
  } catch (error) {
    // 如果智谱AI调用失败，抛出错误让上层处理
    console.warn('智谱AI调用失败:', error);
    throw error;
  }
}
