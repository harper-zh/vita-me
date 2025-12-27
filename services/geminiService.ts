/**
 * 演示模式 (Mock Mode)：
 * 为了让您可以立刻在 Kiro 中看到效果，我们预设了一套基于莫兰迪风格的解读。
 * 如果将来需要开启真实的 AI 功能，只需取消下方 getAIInterpretation 的注释并配置 API Key 即可。
 */

export const getAIInterpretation = async (baziData: any) => {
  // 模拟 AI 思考的加载感 (0.8秒)
  await new Promise(resolve => setTimeout(resolve, 800));

  // 这是为您预设的"固定的"治愈系报告
  // 数据结构严格按照 UI 需要的格式
  return {
    personality: "你的生命底色如同初春的雨后森林，带有清新的木质香气与坚韧的生长力。你擅长在喧嚣中寻找宁静，内心深处有着极强的感知力，能够敏锐地捕捉到生活中的微小美学。",
    vitamin: "多巴胺森林漫步",
    advice: "今天适合放下手中的电子设备，去公园或有绿植的地方进行一次深度呼吸，让自然能量修复你的精神内耗。",
    luckyColor: "鼠尾草绿 (Sage Green)",
    elementBalance: "木气充盈，火气待补"
  };
};

export const getMoneyAdvice = async (baziData: any) => {
  // 模拟 AI 思考的加载感 (0.5秒)
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 根据八字数据生成不同的搞钱建议 (暂时用模拟数据)
  const adviceOptions = [
    {
      title: "今日财运指南",
      advice: "你的日主偏向稳健型投资，今日适合关注长期价值投资机会。避免冲动消费，可以考虑在下午2-4点进行重要的财务决策。",
      luckyDirection: "东南方",
      luckyTime: "14:00-16:00",
      suggestion: "理财建议：定投基金或储蓄计划"
    },
    {
      title: "财富能量提升",
      advice: "今日财星旺盛，适合进行商务谈判或签署合同。你的直觉力较强，可以信任内心的判断来做投资决策。",
      luckyDirection: "正南方",
      luckyTime: "10:00-12:00",
      suggestion: "投资建议：关注科技或新能源板块"
    }
  ];
  
  // 根据日主天干选择不同建议 (简化版逻辑)
  const dayMaster = baziData?.dayMaster || '甲';
  const index = dayMaster.charCodeAt(0) % adviceOptions.length;
  
  return adviceOptions[index];
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