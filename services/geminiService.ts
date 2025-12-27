/**
 * 动态内容生成系统 (Dynamic Content Generation)：
 * 基于用户出生信息生成个性化内容，包含多模板系统和性别偏见过滤
 */

// 性别偏见过滤规则库
const filterRules = new Map([
  // 婚姻相关偏见
  ['克夫', '婚姻中需要更多沟通理解'],
  ['旺夫', '能为伴侣带来正面影响'],
  ['命硬', '性格坚强独立'],
  ['不利婚姻', '在感情中需要更多耐心'],
  ['婚姻不顺', '感情路上可能遇到挑战'],
  
  // 性格相关偏见
  ['性格刚烈', '性格坚定有主见'],
  ['不够温柔', '个性直率真诚'],
  ['太过强势', '领导能力强'],
  ['不适合做妻子', '更适合发展事业'],
  ['缺乏女性魅力', '有独特的个人魅力'],
  
  // 事业相关偏见
  ['不宜抛头露面', '适合多元化发展'],
  ['应该在家相夫教子', '可以选择适合自己的生活方式'],
  ['女子无才便是德', '有很好的学习和发展潜力'],
  ['不适合从商', '具备商业头脑'],
  
  // 生育相关偏见
  ['子息艰难', '在生育方面可能需要更多关注'],
  ['无子命', '可能更专注于其他人生目标'],
  ['不利生育', '在家庭规划上需要综合考虑'],
  
  // 消极词汇优化
  ['命运不好', '人生中会遇到一些挑战'],
  ['运势低迷', '目前处于蓄势待发的阶段'],
  ['诸事不顺', '需要更多耐心等待时机'],
  ['灾祸连连', '可能会遇到一些考验'],
  ['孤独终老', '享受独立自主的生活'],
  ['一生劳碌', '勤劳努力，收获满满'],
  ['贫穷潦倒', '在财务管理上需要更多规划']
]);

// 内容模板库
const contentTemplates = {
  personality: [
    // 模板1: 自然系
    "妳的生命底色如同{season}的{nature}，带有{quality}的气质与{strength}的内在力量。妳擅长在{environment}中寻找平衡，内心深处有着{trait}的感知力。",
    // 模板2: 艺术系  
    "妳的性格如同{art_style}的画作，层次丰富而{color_tone}。妳有着{creative_trait}的创造力，善于将{inspiration}转化为独特的表达方式。",
    // 模板3: 哲学系
    "妳的内在世界如同{philosophy}般深邃，拥有{wisdom_trait}的洞察力。妳倾向于通过{thinking_way}来理解世界，在{life_aspect}中展现出独特的智慧。",
    // 模板4: 能量系
    "妳的能量场呈现{energy_pattern}的流动状态，具有{energy_trait}的特质。妳的{power_source}能够为周围的人带来{positive_effect}的影响。",
    // 模板5: 元素系
    "妳的本质与{element}元素共振，展现出{element_trait}的特性。妳在{element_environment}中能够发挥最佳状态，拥有{element_power}的天赋能力。"
  ],
  
  career: [
    // 事业模板1: 发展导向
    "妳的事业发展呈现{career_pattern}的轨迹，适合在{industry}领域发挥才能。建议关注{opportunity}的机会，通过{development_way}来提升竞争力。",
    // 事业模板2: 能力导向
    "妳具备{skill_type}的核心能力，在{work_environment}中能够展现优势。未来可以考虑向{direction}发展，重点培养{key_skill}技能。",
    // 事业模板3: 机遇导向
    "当前妳的事业运势处于{phase}阶段，{timing}是关键的转折点。把握{chance}的机会，可以在{field}领域获得突破。"
  ],
  
  wealth: [
    // 财运模板1: 投资理财
    "妳的财运呈现{wealth_pattern}的特点，适合{investment_style}的理财方式。建议在{timing}关注{investment_target}，通过{strategy}来积累财富。",
    // 财运模板2: 收入来源
    "妳的主要财富来源倾向于{income_source}，具有{earning_trait}的赚钱能力。可以考虑开发{side_income}作为补充收入。",
    // 财运模板3: 财务管理
    "妳在财务管理上展现{management_style}的特点，建议加强{weak_area}方面的规划。通过{improvement_way}可以提升财务状况。"
  ],
  
  love: [
    // 感情模板1: 关系模式
    "妳在感情中展现{love_style}的特质，倾向于{relationship_pattern}的相处模式。理想的伴侣类型是{partner_type}，需要在{aspect}方面多加注意。",
    // 感情模板2: 情感表达
    "妳的情感表达方式偏向{expression_style}，在{situation}中能够展现真实的自己。建议通过{communication_way}来增进感情交流。",
    // 感情模板3: 婚姻家庭
    "妳对婚姻家庭有着{family_view}的期待，适合{marriage_timing}建立稳定关系。在{family_role}方面能够发挥重要作用。"
  ],
  
  health: [
    // 健康模板1: 体质特点
    "妳的体质特点偏向{constitution_type}，需要特别关注{health_focus}方面的保养。建议采用{health_method}的养生方式。",
    // 健康模板2: 生活习惯
    "妳适合{lifestyle_pattern}的生活节奏，在{time_period}进行{activity}对健康最为有益。注意避免{health_risk}的不良习惯。",
    // 健康模板3: 情绪管理
    "妳的情绪状态与{emotion_pattern}相关，建议通过{emotion_method}来调节心理健康。在{stress_situation}时要特别注意情绪管理。"
  ],
  
  advice: [
    // 建议模板1: 行动导向
    "今日适合进行{action_type}的活动，在{time_range}是最佳时机。建议{specific_action}，这将为妳带来{benefit}的效果。",
    // 建议模板2: 心态导向
    "保持{mindset}的心态是今日的关键，面对{challenge}时要{attitude}。通过{mental_practice}可以提升内在能量。",
    // 建议模板3: 能量导向
    "今日妳的能量适合{energy_activity}，避免{avoid_activity}。在{environment}中进行{practice}能够最大化能量效果。"
  ]
};

// 变量填充库
const variableLibrary = {
  season: ['初春', '盛夏', '金秋', '寒冬', '晚春', '初夏', '深秋', '暖冬'],
  nature: ['雨后森林', '晨曦海岸', '雪山之巅', '花田小径', '竹林深处', '溪流石畔'],
  quality: ['清新', '温润', '坚韧', '灵动', '沉稳', '优雅', '纯净', '深邃'],
  strength: ['生长', '包容', '突破', '创造', '守护', '转化', '净化', '觉醒'],
  environment: ['喧嚣', '宁静', '变化', '挑战', '机遇', '困境', '繁华', '简朴'],
  trait: ['敏锐', '深刻', '细腻', '直觉', '理性', '感性', '独特', '全面'],
  
  art_style: ['印象派', '抽象派', '写实主义', '浪漫主义', '现代主义', '极简主义'],
  color_tone: ['温暖明亮', '深沉内敛', '清新淡雅', '浓烈鲜明', '柔和细腻'],
  creative_trait: ['天马行空', '细致入微', '大胆创新', '精益求精', '灵感丰富'],
  
  philosophy: ['老庄哲学', '禅宗思想', '西方哲学', '人文主义', '存在主义'],
  wisdom_trait: ['超然', '通透', '深邃', '敏锐', '包容', '理性'],
  thinking_way: ['直觉感知', '逻辑分析', '整体思维', '细节观察', '创新思考'],
  
  energy_pattern: ['螺旋上升', '波浪起伏', '稳定流动', '脉冲跳跃', '循环往复'],
  energy_trait: ['温和治愈', '强劲有力', '灵动变化', '深沉稳定', '清新活跃'],
  power_source: ['内在光芒', '自然能量', '智慧之光', '爱的力量', '创造之火'],
  
  element: ['木', '火', '土', '金', '水'],
  element_trait: ['生机勃勃', '热情洋溢', '稳重踏实', '锐利精准', '智慧深邃'],
  element_environment: ['自然环境', '社交场合', '稳定环境', '竞争环境', '学习环境'],
  element_power: ['成长治愈', '感染激励', '承载包容', '决断执行', '洞察应变']
};

class ContentGenerator {
  // 创建种子算法
  createSeed(year: number, month: number, day: number, hour: number): number {
    return (year * 1000 + month * 100 + day * 10 + hour) % 1000;
  }

  // 性别偏见过滤
  filterContent(content: string): { content: string; hasFiltered: boolean } {
    let filteredContent = content;
    let hasFiltered = false;

    for (const [original, friendly] of filterRules) {
      const regex = new RegExp(original, 'gi');
      if (regex.test(filteredContent)) {
        filteredContent = filteredContent.replace(regex, friendly);
        hasFiltered = true;
      }
    }

    return {
      content: filteredContent,
      hasFiltered: hasFiltered
    };
  }

  // 根据种子选择变量
  selectVariable(seed: number, category: string, index: number = 0): string {
    const variables = variableLibrary[category as keyof typeof variableLibrary] || ['默认'];
    const adjustedSeed = (seed + index * 17) % variables.length;
    return variables[adjustedSeed];
  }

  // 填充模板变量
  fillTemplate(template: string, seed: number): string {
    let filledTemplate = template;
    let variableIndex = 0;

    // 匹配所有 {variable} 格式的变量
    filledTemplate = filledTemplate.replace(/\{(\w+)\}/g, (match, variable) => {
      return this.selectVariable(seed, variable, variableIndex++);
    });

    return filledTemplate;
  }

  // 生成个性化内容
  generatePersonalizedContent(baziData: any, formData: any) {
    const { year, month, day, hour } = formData;
    const seed = this.createSeed(year, month, day, hour);

    // 根据种子选择不同模板
    const personalityTemplate = contentTemplates.personality[seed % contentTemplates.personality.length];
    const careerTemplate = contentTemplates.career[(seed + 1) % contentTemplates.career.length];
    const wealthTemplate = contentTemplates.wealth[(seed + 2) % contentTemplates.wealth.length];
    const loveTemplate = contentTemplates.love[(seed + 3) % contentTemplates.love.length];
    const healthTemplate = contentTemplates.health[(seed + 4) % contentTemplates.health.length];
    const adviceTemplate = contentTemplates.advice[(seed + 5) % contentTemplates.advice.length];

    // 填充模板变量
    const personality = this.fillTemplate(personalityTemplate, seed);
    const career = this.fillTemplate(careerTemplate, seed + 100);
    const wealth = this.fillTemplate(wealthTemplate, seed + 200);
    const love = this.fillTemplate(loveTemplate, seed + 300);
    const health = this.fillTemplate(healthTemplate, seed + 400);
    const advice = this.fillTemplate(adviceTemplate, seed + 500);

    // 应用性别偏见过滤
    const filteredPersonality = this.filterContent(personality);
    const filteredCareer = this.filterContent(career);
    const filteredWealth = this.filterContent(wealth);
    const filteredLove = this.filterContent(love);
    const filteredHealth = this.filterContent(health);
    const filteredAdvice = this.filterContent(advice);

    return {
      personality: filteredPersonality.content,
      career: filteredCareer.content,
      wealth: filteredWealth.content,
      love: filteredLove.content,
      health: filteredHealth.content,
      advice: filteredAdvice.content,
      hasFiltered: [filteredPersonality, filteredCareer, filteredWealth, filteredLove, filteredHealth, filteredAdvice]
        .some(result => result.hasFiltered)
    };
  }

  // 生成维生素和颜色建议
  generateVitaminAndColor(seed: number) {
    const vitamins = [
      '多巴胺森林漫步', '血清素音乐疗愈', '内啡肽运动释放', '催产素温暖拥抱', 
      '褪黑素深度冥想', '肾上腺素冒险体验', '去甲肾上腺素专注力提升', '乙酰胆碱学习增强'
    ];
    
    const colors = [
      '鼠尾草绿 (Sage Green)', '暖杏仁米 (Warm Almond)', '薄雾蓝 (Misty Blue)', 
      '桃花粉 (Peach Blossom)', '象牙白 (Ivory White)', '深海蓝 (Deep Ocean)', 
      '日落橙 (Sunset Orange)', '薰衣草紫 (Lavender Purple)'
    ];

    return {
      vitamin: vitamins[seed % vitamins.length],
      luckyColor: colors[seed % colors.length]
    };
  }

  // 生成元素平衡状态
  generateElementBalance(baziData: any, seed: number) {
    const elements = ['木', '火', '土', '金', '水'];
    const states = ['充盈', '平衡', '待补', '过旺', '不足'];
    
    const primaryElement = elements[seed % elements.length];
    const primaryState = states[seed % states.length];
    const secondaryElement = elements[(seed + 1) % elements.length];
    const secondaryState = states[(seed + 2) % states.length];

    return `${primaryElement}气${primaryState}，${secondaryElement}气${secondaryState}`;
  }
}

const contentGenerator = new ContentGenerator();

export const getAIInterpretation = async (baziData: any, formData?: any) => {
  // 模拟 AI 思考的加载感 (0.8秒)
  await new Promise(resolve => setTimeout(resolve, 800));

  // 如果没有表单数据，使用默认值
  const defaultFormData = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 12
  };

  const actualFormData = formData || defaultFormData;
  const seed = contentGenerator.createSeed(actualFormData.year, actualFormData.month, actualFormData.day, actualFormData.hour);
  
  // 生成个性化内容
  const personalizedContent = contentGenerator.generatePersonalizedContent(baziData, actualFormData);
  const vitaminAndColor = contentGenerator.generateVitaminAndColor(seed);
  const elementBalance = contentGenerator.generateElementBalance(baziData, seed);

  return {
    personality: personalizedContent.personality,
    vitamin: vitaminAndColor.vitamin,
    advice: personalizedContent.advice,
    luckyColor: vitaminAndColor.luckyColor,
    elementBalance: elementBalance,
    hasFiltered: personalizedContent.hasFiltered
  };
};

export const getMoneyAdvice = async (baziData: any, formData?: any) => {
  // 模拟 AI 思考的加载感 (0.5秒)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const defaultFormData = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 12
  };

  const actualFormData = formData || defaultFormData;
  const seed = contentGenerator.createSeed(actualFormData.year, actualFormData.month, actualFormData.day, actualFormData.hour);
  
  const adviceOptions = [
    {
      title: "今日财运指南",
      advice: "妳的财运呈现稳健上升的趋势，适合进行长期价值投资。今日的直觉力较强，可以信任内心的判断来做重要的财务决策。",
      luckyDirection: "东南方",
      luckyTime: "14:00-16:00", 
      suggestion: "理财建议：定投基金或储蓄计划"
    },
    {
      title: "财富能量提升",
      advice: "当前妳的财星运势旺盛，适合进行商务谈判或签署重要合同。妳的洞察力能够帮助识别潜在的投资机会。",
      luckyDirection: "正南方",
      luckyTime: "10:00-12:00",
      suggestion: "投资建议：关注科技或新能源板块"
    },
    {
      title: "财务规划优化",
      advice: "妳在财务管理方面展现出谨慎理性的特质，适合制定长期的财富积累计划。避免冲动消费，专注于稳定收益。",
      luckyDirection: "正北方", 
      luckyTime: "16:00-18:00",
      suggestion: "规划建议：建立应急基金和退休储蓄"
    }
  ];
  
  // 根据种子选择建议
  const selectedAdvice = adviceOptions[seed % adviceOptions.length];
  
  // 应用性别偏见过滤
  const filteredAdvice = contentGenerator.filterContent(selectedAdvice.advice);
  
  return {
    ...selectedAdvice,
    advice: filteredAdvice.content
  };
};

/* 
// 真实的 AI 调用逻辑（等您有 API Key 后启用）
import { GoogleGenAI, Type } from "@google/genai";

export const getRealAIInterpretation = async (baziData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "请根据八字计算结果返回 JSON 解读...",
    // ... 配置同上 ...
  });
  return JSON.parse(response.text);
}

export const getRealMoneyAdvice = async (baziData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "请根据八字数据生成今日财运建议...",
    // ... 配置同上 ...
  });
  return JSON.parse(response.text);
}
*/