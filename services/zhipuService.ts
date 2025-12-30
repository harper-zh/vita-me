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
你是一位温和智慧的命理师，请根据以下八字信息生成个性化解读。

基本信息：
- 出生时间：${formData.year}年${formData.month}月${formData.day}日${formData.hour}时
- 八字数据：${JSON.stringify(baziData, null, 2)}

请用温和、积极、现代的语言风格，避免传统命理中的消极表述。每个方面都要个性化，不要使用通用模板。

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
  }
}

重要要求：
1. 语言现代化，避免"克夫"、"命硬"等传统负面词汇
2. 建议要实用，符合现代生活
3. 保持积极正面的基调
4. 内容要有个性化差异，不要千篇一律
5. 严格遵循JSON格式，确保可以被解析
`;

  try {
    const result = await callZhipuAPI(prompt, {
      model: 'glm-4-plus',
      temperature: 0.8,
      max_tokens: 2500,
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
