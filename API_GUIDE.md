# 智谱AI API调用指南

## 什么是API调用？

API（Application Programming Interface）调用就像是你的应用和智谱AI之间的"对话"：

```
你的应用 → 发送问题 → 智谱AI服务器 → 处理问题 → 返回答案 → 你的应用显示结果
```

## 基本概念

### 1. API Key（密钥）
- **作用**：证明你的身份，就像门卡一样
- **获取**：在智谱AI开放平台申请
- **使用**：每次调用API时都要带上

### 2. HTTP请求
- **作用**：向服务器发送数据的方式
- **方法**：POST（发送数据）
- **格式**：JSON（结构化数据）

### 3. 请求参数
```javascript
{
  "model": "glm-4-plus",           // 使用的AI模型
  "messages": [                    // 对话内容
    {
      "role": "user",              // 角色：用户
      "content": "你好，请介绍一下自己"  // 具体问题
    }
  ],
  "temperature": 0.7,              // 创造性程度（0-1）
  "max_tokens": 1000               // 最大回复长度
}
```

## 实际调用流程

### 步骤1：准备API Key
1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册并登录账户
3. 在"API Keys"页面创建新密钥
4. 复制你的API Key

### 步骤2：设置环境变量
1. 复制 `.env.example` 文件并重命名为 `.env`
2. 将你的API Key填入：
```
ZHIPU_API_KEY=你的实际API密钥
```

### 步骤3：在代码中使用
```javascript
// 调用智谱AI生成八字解读
const result = await generateBaziInterpretation(baziData, formData);
console.log(result); // 查看AI返回的结果
```

## 代码示例

### 基础调用
```javascript
// 发送简单问题
const response = await callZhipuAPI("请介绍一下八字命理的基本概念");
console.log(response.content); // AI的回答
```

### 高级调用
```javascript
// 自定义参数
const response = await callZhipuAPI("分析这个八字", {
  model: "glm-4-plus",      // 使用更强的模型
  temperature: 0.8,         // 更有创造性
  max_tokens: 1500          // 更长的回复
});
```

## 参数说明

### model（模型选择）
- `glm-4-plus`：最新最强模型，推荐使用
- `glm-4`：标准模型
- `glm-3-turbo`：快速模型

### temperature（创造性）
- `0.1-0.3`：严谨、一致的回答
- `0.4-0.7`：平衡的回答（推荐）
- `0.8-1.0`：创造性、多样的回答

### max_tokens（回复长度）
- `100-500`：简短回答
- `500-1000`：中等长度（推荐）
- `1000+`：详细回答

## 错误处理

### 常见错误
1. **401 Unauthorized**：API Key错误
   - 检查API Key是否正确
   - 确认.env文件配置

2. **429 Too Many Requests**：请求太频繁
   - 降低请求频率
   - 添加重试机制

3. **500 Internal Server Error**：服务器错误
   - 稍后重试
   - 检查请求格式

### 调试技巧
```javascript
// 在浏览器控制台查看详细错误
console.log('API调用结果:', result);
if (!result.success) {
  console.error('错误详情:', result.error);
}
```

## 成本控制

### 计费方式
- 按Token计费（输入+输出）
- 1个中文字符 ≈ 1个Token
- 1000个Token ≈ 1000个中文字符

### 节省成本的方法
1. 精简提示词
2. 设置合理的max_tokens
3. 缓存常用结果
4. 使用合适的模型

## 集成到项目

### 修改现有服务
在 `services/geminiService.ts` 中添加智谱AI调用：

```javascript
import { generateBaziInterpretation, generateMoneyAdvice } from './zhipuService';

// 替换原有的模拟数据生成
export const getAIInterpretation = async (baziData: any, formData?: any) => {
  // 使用真实的AI调用
  return await generateBaziInterpretation(baziData, formData);
};
```

### 测试调用
```javascript
// 在浏览器控制台测试
const testData = { /* 你的八字数据 */ };
const testForm = { year: 1990, month: 5, day: 15, hour: 12 };
generateBaziInterpretation(testData, testForm).then(console.log);
```

## 安全注意事项

1. **保护API Key**
   - 不要提交到Git仓库
   - 使用环境变量存储
   - 定期更换密钥

2. **请求限制**
   - 设置合理的超时时间
   - 实现重试机制
   - 监控使用量

3. **数据隐私**
   - 不发送敏感个人信息
   - 遵守数据保护法规

## 下一步

1. 获取你的智谱AI API Key
2. 配置环境变量
3. 测试API调用
4. 集成到你的八字应用中

有任何问题随时问我！