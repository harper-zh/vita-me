#!/usr/bin/env node

/**
 * API状态检查脚本
 * 检查智谱API和Gemini API的配置状态
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 检查API配置状态...\n');

// 检查环境变量文件
function checkEnvFile() {
  const envPath = '.env.local';
  
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local文件不存在');
    return false;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n').filter(line => line.trim());
  
  console.log('📄 环境变量文件内容:');
  
  let hasZhipuKey = false;
  let hasGeminiKey = false;
  
  lines.forEach(line => {
    if (line.startsWith('ZHIPU_API_KEY=')) {
      const value = line.split('=')[1];
      hasZhipuKey = value && value !== 'your_zhipu_api_key_here';
      console.log(`   ZHIPU_API_KEY: ${hasZhipuKey ? '✅ 已配置' : '❌ 未配置或使用占位符'}`);
    } else if (line.startsWith('GEMINI_API_KEY=')) {
      const value = line.split('=')[1];
      hasGeminiKey = value && value !== 'PLACEHOLDER_API_KEY';
      console.log(`   GEMINI_API_KEY: ${hasGeminiKey ? '✅ 已配置' : '❌ 未配置或使用占位符'}`);
    }
  });
  
  return { hasZhipuKey, hasGeminiKey };
}

// 检查Vite配置
function checkViteConfig() {
  const vitePath = 'vite.config.ts';
  
  if (!fs.existsSync(vitePath)) {
    console.log('❌ vite.config.ts文件不存在');
    return false;
  }
  
  const viteContent = fs.readFileSync(vitePath, 'utf8');
  
  const hasZhipuEnv = viteContent.includes('ZHIPU_API_KEY');
  const hasGeminiEnv = viteContent.includes('GEMINI_API_KEY');
  
  console.log('\n⚙️  Vite配置检查:');
  console.log(`   ZHIPU_API_KEY环境变量: ${hasZhipuEnv ? '✅ 已定义' : '❌ 未定义'}`);
  console.log(`   GEMINI_API_KEY环境变量: ${hasGeminiEnv ? '✅ 已定义' : '❌ 未定义'}`);
  
  return { hasZhipuEnv, hasGeminiEnv };
}

// 检查服务文件
function checkServiceFiles() {
  const zhipuPath = 'services/zhipuService.ts';
  const geminiPath = 'services/geminiService.ts';
  
  console.log('\n📁 服务文件检查:');
  
  const zhipuExists = fs.existsSync(zhipuPath);
  const geminiExists = fs.existsSync(geminiPath);
  
  console.log(`   zhipuService.ts: ${zhipuExists ? '✅ 存在' : '❌ 不存在'}`);
  console.log(`   geminiService.ts: ${geminiExists ? '✅ 存在' : '❌ 不存在'}`);
  
  return { zhipuExists, geminiExists };
}

// 检查Result.tsx中的API调用
function checkResultPage() {
  const resultPath = 'pages/Result.tsx';
  
  if (!fs.existsSync(resultPath)) {
    console.log('\n❌ pages/Result.tsx文件不存在');
    return false;
  }
  
  const resultContent = fs.readFileSync(resultPath, 'utf8');
  
  const hasZhipuImport = resultContent.includes('zhipuService');
  const hasGeminiImport = resultContent.includes('geminiService');
  const hasZhipuCall = resultContent.includes('generateBaziInterpretation') || resultContent.includes('generateMoneyAdvice');
  
  console.log('\n📄 Result.tsx API调用检查:');
  console.log(`   智谱服务导入: ${hasZhipuImport ? '✅ 已导入' : '❌ 未导入'}`);
  console.log(`   Gemini服务导入: ${hasGeminiImport ? '✅ 已导入' : '❌ 未导入'}`);
  console.log(`   智谱API调用: ${hasZhipuCall ? '✅ 已实现' : '❌ 未实现'}`);
  
  return { hasZhipuImport, hasGeminiImport, hasZhipuCall };
}

// 主检查函数
function main() {
  const envCheck = checkEnvFile();
  const viteCheck = checkViteConfig();
  const serviceCheck = checkServiceFiles();
  const resultCheck = checkResultPage();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 检查结果汇总:');
  
  if (envCheck.hasZhipuKey && viteCheck.hasZhipuEnv && serviceCheck.zhipuExists && resultCheck.hasZhipuCall) {
    console.log('🎉 智谱AI配置完整，可以正常使用');
  } else {
    console.log('⚠️  智谱AI配置不完整');
    
    if (!envCheck.hasZhipuKey) {
      console.log('   - 需要在.env.local中配置ZHIPU_API_KEY');
    }
    if (!viteCheck.hasZhipuEnv) {
      console.log('   - 需要在vite.config.ts中定义ZHIPU_API_KEY环境变量');
    }
    if (!serviceCheck.zhipuExists) {
      console.log('   - 需要创建services/zhipuService.ts文件');
    }
    if (!resultCheck.hasZhipuCall) {
      console.log('   - 需要在Result.tsx中调用智谱API');
    }
  }
  
  console.log('\n📋 下一步操作:');
  if (!envCheck.hasZhipuKey) {
    console.log('1. 获取智谱AI API密钥: https://open.bigmodel.cn/');
    console.log('2. 在.env.local中设置: ZHIPU_API_KEY=你的密钥');
  }
  console.log('3. 运行测试: npm run test:zhipu');
  console.log('4. 启动开发服务器: npm run dev');
  
  console.log('='.repeat(50));
}

// 运行检查
main();