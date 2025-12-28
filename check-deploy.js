#!/usr/bin/env node

/**
 * 简单的部署状态检查脚本
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 检查部署配置...\n');

// 检查必要文件
const requiredFiles = [
  '.github/workflows/deploy.yml',
  'vite.config.ts',
  'package.json'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 缺失`);
    allFilesExist = false;
  }
});

// 检查package.json中的脚本
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredScripts = ['build', 'dev', 'preview'];
  
  console.log('\n📦 检查package.json脚本:');
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`✅ ${script} - 已配置`);
    } else {
      console.log(`❌ ${script} - 缺失`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ 无法读取package.json');
  allFilesExist = false;
}

// 检查构建输出目录
if (fs.existsSync('dist')) {
  console.log('\n🏗️  构建输出:');
  console.log('✅ dist目录存在');
  
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ index.html存在');
  } else {
    console.log('⚠️  index.html不存在，请运行 npm run build');
  }
} else {
  console.log('\n🏗️  构建输出:');
  console.log('⚠️  dist目录不存在，请运行 npm run build');
}

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 部署配置完整！');
  console.log('\n📋 下一步操作:');
  console.log('1. 推送代码到GitHub: git push origin main');
  console.log('2. 在GitHub仓库设置中启用Pages');
  console.log('3. 等待自动部署完成');
} else {
  console.log('❌ 部署配置不完整，请检查缺失的文件');
}

console.log('='.repeat(50));