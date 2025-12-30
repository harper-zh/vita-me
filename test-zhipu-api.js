#!/usr/bin/env node

/**
 * 智谱AI API测试脚本
 * 用于验证API配置和调用是否正常
 */

import { generateBaziInterpretation, generateMoneyAdvice } from './services/zhipuService.ts';

// 模拟测试数据
const testBaziData = {
  year: '庚午',
  month: '戊午', 
  day: '甲子',
  hour: '丙寅',
  elements: {
    wood: 2,
    fire: 3,
    earth: 2,
    metal: 1,
    water: 1
  }
};

const testFormData = {
  year: 1990,
  month: 5,
  day: 15,
  hour: 12,
  vitaminId: 'TEST001',
  province: '北京市',
  city: '朝阳区'
};

async function testZhipuAPI() {
  console.log('🧪 开始测试智谱AI API...\n');
  
  // 检查环境变量
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey || apiKey === 'your_zhipu_api_key_here') {
    console.log('❌ 智谱API密钥未配置');
    console.log('📋 配置步骤:');
    console.log('1. 获取智谱AI API密钥: https://open.bigmodel.cn/');
    console.log('2. 在.env.local中设置: ZHIPU_API_KEY=你的密钥');
    console.log('3. 重新运行测试');
    return;
  }
  
  console.log('✅ API密钥已配置');
  console.log(`🔑 密钥前缀: ${apiKey.substring(0, 8)}...`);
  
  try {
    // 测试八字解读生成
    console.log('\n🔮 测试八字解读生成...');
    const interpretation = await generateBaziInterpretation(testBaziData, testFormData);
    
    if (interpretation.source === 'ai') {
      console.log('✅ 智谱AI八字解读调用成功');
      console.log(`📊 使用模型: ${interpretation.model}`);
      console.log(`📝 性格分析: ${interpretation.personality.substring(0, 50)}...`);
    } else {
      console.log('⚠️ 使用了回退数据，智谱AI调用可能失败');
    }
    
    // 测试财运建议生成
    console.log('\n💰 测试财运建议生成...');
    const moneyAdvice = await generateMoneyAdvice(testBaziData, testFormData);
    
    if (moneyAdvice.source === 'ai') {
      console.log('✅ 智谱AI财运建议调用成功');
      console.log(`📊 使用模型: ${moneyAdvice.model}`);
      console.log(`💡 建议标题: ${moneyAdvice.title}`);
    } else {
      console.log('⚠️ 使用了回退数据，智谱AI调用可能失败');
    }
    
    console.log('\n🎉 API测试完成！');
    
  } catch (error) {
    console.error('\n❌ API测试失败:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查API密钥是否正确');
    console.log('2. 检查网络连接');
    console.log('3. 检查智谱AI账户余额');
    console.log('4. 查看详细错误日志');
  }
}

// 运行测试
testZhipuAPI().catch(console.error);