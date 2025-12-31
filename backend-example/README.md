# 唯她命监控数据后台服务

## 快速启动

### 1. 安装依赖
```bash
cd backend-example
npm install
```

### 2. 启动服务
```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

### 3. 设置环境变量（可选）
```bash
# 设置API Key
export MONITORING_API_KEY=your-secret-api-key

# 设置端口
export PORT=3001
```

## 接口说明

### POST /api/monitoring
接收监控数据

**请求头:**
```
Content-Type: application/json
Authorization: Bearer your-api-key (可选)
```

**响应:**
```json
{
  "success": true,
  "message": "监控数据接收成功",
  "filename": "monitoring-2024-01-01-12-00-00-000Z.json"
}
```

### GET /api/health
健康检查

### GET /api/monitoring/list
获取已保存的监控数据文件列表

## 数据存储

监控数据会保存在 `monitoring-data/` 目录下，按日期和时间戳命名：
- `monitoring-2024-01-01-12-00-00-000Z.json`

## 部署建议

### 本地部署
```bash
# 在3001端口启动
npm start
```
**接口地址:** `http://localhost:3001/api/monitoring`

### 云服务器部署
1. 上传代码到服务器
2. 安装依赖: `npm install`
3. 使用PM2启动: `pm2 start server.js --name vita-me-monitoring`
4. 配置Nginx反向代理（可选）

**接口地址:** `https://your-domain.com/api/monitoring`

### 使用现有服务
如果你已有后台服务，只需添加一个接收POST请求的接口即可。

### 在本地启动流程-启动算命软件
### cd D:\vitame-github\vita-me
### npm run dev 包管理器运行开发模式

### 在本地启动后台监控流程
### cd D:\vitame-github\vita-me\backend-example
### node server.js  运行环境
### 数据导出网址：http://localhost:3000/#/export（本地）

