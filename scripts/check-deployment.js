#!/usr/bin/env node

/**
 * 部署状态检查脚本
 * 用于检查GitHub Pages部署状态
 */

import https from 'https';
import { execSync } from 'child_process';

// 获取仓库信息
function getRepoInfo() {
  try {
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^/.]+)/);
    
    if (match) {
      return {
        owner: match[1],
        repo: match[2]
      };
    }
  } catch (error) {
    console.error('❌ 无法获取仓库信息:', error.message);
  }
  return null;
}

// 检查GitHub Pages状态
function checkPagesStatus(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/pages`,
      method: 'GET',
      headers: {
        'User-Agent': 'Deployment-Checker',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          const pages = JSON.parse(data);
          resolve(pages);
        } else if (res.statusCode === 404) {
          resolve(null); // Pages未启用
        } else {
          reject(new Error(`API请求失败: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

// 检查网站可访问性
function checkSiteAccessibility(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'HEAD',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      resolve({
        accessible: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode
      });
    });

    req.on('error', () => {
      resolve({ accessible: false, statusCode: null });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ accessible: false, statusCode: 'timeout' });
    });

    req.end();
  });
}

// 主函数
async function main() {
  console.log('🔍 检查部署状态...\n');

  const repoInfo = getRepoInfo();
  if (!repoInfo) {
    console.log('❌ 无法获取仓库信息，请确保在Git仓库中运行此脚本');
    process.exit(1);
  }

  console.log(`📦 仓库: ${repoInfo.owner}/${repoInfo.repo}`);

  try {
    // 检查GitHub Pages配置
    const pagesInfo = await checkPagesStatus(repoInfo.owner, repoInfo.repo);
    
    if (!pagesInfo) {
      console.log('❌ GitHub Pages未启用');
      console.log('\n📋 启用步骤:');
      console.log('1. 进入仓库Settings → Pages');
      console.log('2. Source选择"GitHub Actions"');
      console.log('3. 推送代码触发部署');
      return;
    }

    console.log('✅ GitHub Pages已启用');
    console.log(`🌐 网站地址: ${pagesInfo.html_url}`);
    console.log(`📊 状态: ${pagesInfo.status}`);
    
    if (pagesInfo.build_type) {
      console.log(`🔧 构建类型: ${pagesInfo.build_type}`);
    }

    // 检查网站可访问性
    console.log('\n🌍 检查网站可访问性...');
    const accessibility = await checkSiteAccessibility(pagesInfo.html_url);
    
    if (accessibility.accessible) {
      console.log('✅ 网站可正常访问');
      console.log(`📈 HTTP状态码: ${accessibility.statusCode}`);
    } else {
      console.log('❌ 网站暂时无法访问');
      if (accessibility.statusCode) {
        console.log(`📈 HTTP状态码: ${accessibility.statusCode}`);
      }
      console.log('💡 可能原因: 部署正在进行中，请稍后再试');
    }

  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error.message);
  }

  console.log('\n🚀 部署工作流状态:');
  console.log(`   https://github.com/${repoInfo.owner}/${repoInfo.repo}/actions`);
}

// 运行脚本
main().catch(console.error);