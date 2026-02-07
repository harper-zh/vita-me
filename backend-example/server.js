// 简单的Node.js后台服务示例
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

// 确保数据目录存在
const dataDir = path.join(__dirname, 'monitoring-data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 处理CORS
const setCORSHeaders = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// 创建服务器
const server = http.createServer((req, res) => {
  setCORSHeaders(res);
  
  // 处理OPTIONS请求（CORS预检）
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // 健康检查接口
  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'vita-me-monitoring'
    }));
    return;
  }
  
  // 监控数据接口
  if (req.url === '/api/monitoring' && req.method === 'POST') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const monitoringData = JSON.parse(body);
        
        // 生成文件名（使用固定名称，覆盖之前的数据）
        const filename = `monitoring-latest.json`;
        const filepath = path.join(dataDir, filename);
        
        // 保存数据到文件
        fs.writeFileSync(filepath, JSON.stringify(monitoringData, null, 2));
        
        console.log(`📊 收到监控数据: ${filename}`);
        console.log(`- 会话数: ${monitoringData.sessions?.length || 0}`);
        console.log(`- 总页面浏览: ${monitoringData.statistics?.totalPageViews || 0}`);
        console.log(`- 上传来源: ${monitoringData.metadata?.uploadSource || 'unknown'}`);
        
        // 返回成功响应
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: '监控数据接收成功',
          filename: filename
        }));
        
      } catch (error) {
        console.error('处理监控数据时出错:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: '服务器内部错误' 
        }));
      }
    });
    
    return;
  }
  
  // 获取监控数据列表
  if (req.url === '/api/monitoring/list' && req.method === 'GET') {
    try {
      const files = fs.readdirSync(dataDir)
        .filter(file => file.startsWith('monitoring-') && file.endsWith('.json'))
        .map(file => {
          const filepath = path.join(dataDir, file);
          const stats = fs.statSync(filepath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.created - a.created);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        files: files,
        total: files.length
      }));
    } catch (error) {
      console.error('获取文件列表时出错:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: '无法获取文件列表' 
      }));
    }
    return;
  }

  // 获取单个监控数据文件
  if (req.url.startsWith('/api/monitoring/file/') && req.method === 'GET') {
    try {
      const filename = req.url.replace('/api/monitoring/file/', '');
      const filepath = path.join(dataDir, filename);
      
      if (!fs.existsSync(filepath) || !filename.startsWith('monitoring-') || !filename.endsWith('.json')) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'File not found' }));
        return;
      }
      
      const fileContent = fs.readFileSync(filepath, 'utf8');
      const jsonData = JSON.parse(fileContent);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(jsonData));
    } catch (error) {
      console.error('读取文件时出错:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: '无法读取文件' 
      }));
    }
    return;
  }

  // 清空所有监控数据
  if (req.url === '/api/monitoring/clear' && req.method === 'DELETE') {
    try {
      const files = fs.readdirSync(dataDir)
        .filter(file => file.startsWith('monitoring-') && file.endsWith('.json'));
      
      let deletedCount = 0;
      files.forEach(file => {
        const filepath = path.join(dataDir, file);
        fs.unlinkSync(filepath);
        deletedCount++;
      });
      
      console.log(`🗑️ 已清空 ${deletedCount} 个监控数据文件`);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: true, 
        message: `已清空 ${deletedCount} 个监控数据文件`,
        deletedCount
      }));
    } catch (error) {
      console.error('清空数据时出错:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        success: false, 
        error: '清空数据失败' 
      }));
    }
    return;
  }
  
  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 监控数据后台服务启动成功!`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📊 监控接口: http://localhost:${PORT}/api/monitoring`);
  console.log(`💾 数据保存目录: ${dataDir}`);
  console.log(`\n✅ 请在前端监控面板中设置接口地址为:`);
  console.log(`   http://localhost:${PORT}/api/monitoring`);
});

module.exports = server;