# 唯她命应用使用指南

## 🎯 问题解决状态

### ✅ 已解决的问题
1. **应用正常使用** - 核心功能已恢复正常
2. **监控系统集成** - 用户行为监控已完整集成
3. **后台数据上传** - 支持自动和手动上传监控数据

## 🚀 如何使用

### 1. 用户正常使用流程
1. 打开应用：http://localhost:3000
2. 填写出生信息：
   - Vita-Me ID（可选）
   - 出生日期（必填）
   - 出生时辰
   - 出生地点
3. 点击"开启解读"按钮
4. 等待AI生成个性化解读
5. 查看结果页面的各项分析

### 2. 监控数据收集
应用会自动收集以下数据：
- 用户会话时长
- 页面停留时间
- 用户交互次数
- 页面访问路径

### 3. 后台数据上传

#### 开发环境测试
1. 点击右下角蓝色监控按钮
2. 点击"配置"按钮
3. 输入你的后台接口地址
4. 设置API Key（如果需要）
5. 点击"保存配置"
6. 点击"立即上传"测试

#### 生产环境配置
在生产环境中，需要设置环境变量：

```bash
# 后台监控接口地址
REACT_APP_MONITORING_ENDPOINT=https://your-backend.com/api/monitoring

# API密钥（可选）
REACT_APP_MONITORING_API_KEY=your-api-key
```

## 📊 监控数据格式

### 上传到后台的数据结构
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "appName": "vita-me",
  "version": "1.0.0",
  "statistics": {
    "totalSessions": 10,
    "totalTime": 300000,
    "averageSessionTime": 30000,
    "mostVisitedPage": "首页",
    "totalPageViews": 25
  },
  "sessions": [
    {
      "userId": "user_1234567890_abc123def",
      "sessionId": "session_1234567890_xyz789",
      "startTime": 1704110400000,
      "endTime": 1704110700000,
      "totalDuration": 300000,
      "pages": [
        {
          "path": "/",
          "pageName": "首页",
          "startTime": 1704110400000,
          "endTime": 1704110500000,
          "duration": 100000,
          "interactions": 15
        }
      ]
    }
  ],
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "language": "zh-CN",
    "timezone": "Asia/Shanghai",
    "screenResolution": "1920x1080",
    "uploadSource": "auto"
  }
}
```

## 🔧 后台接口要求

你的后台需要提供一个接收监控数据的接口：

```javascript
// Express.js 示例
app.post('/api/monitoring', (req, res) => {
  const monitoringData = req.body;
  
  // 验证API Key（如果需要）
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  if (apiKey !== 'your-expected-api-key') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 保存数据到数据库
  console.log('收到监控数据:', monitoringData);
  
  // 返回成功响应
  res.json({ success: true, message: '数据接收成功' });
});
```

## 📱 功能特性

### 核心功能
- ✅ 八字计算和解读
- ✅ AI个性化分析
- ✅ 五行能量场可视化
- ✅ 每日运势建议
- ✅ 财运和养生建议

### 监控功能
- ✅ 用户行为跟踪
- ✅ 页面停留时间统计
- ✅ 交互行为记录
- ✅ 会话管理
- ✅ 数据导出（JSON/CSV）
- ✅ 自动上传到后台
- ✅ 手动上传功能

## 🛠️ 开发者工具

### 开发环境监控面板
- 实时查看用户行为数据
- 测试后台连接
- 手动上传数据
- 导出监控数据
- 清除本地数据

### 全局函数（生产环境）
```javascript
// 手动上传监控数据
window.uploadMonitoringData();

// 获取监控统计
window.getMonitoringStats();
```

## 🔒 隐私和安全

- 所有监控数据默认存储在用户本地
- 用户可以随时清除监控数据
- 支持匿名用户跟踪
- 数据上传需要明确配置
- 支持API Key认证

## 🚨 故障排除

### 应用无法使用
1. 检查API Key是否正确配置
2. 确保网络连接正常
3. 查看浏览器控制台错误信息

### 监控数据不上传
1. 检查后台接口地址是否正确
2. 测试后台连接状态
3. 确认API Key配置
4. 检查网络防火墙设置

### 按钮点击无反应
1. 检查表单是否填写完整
2. 查看浏览器控制台错误
3. 确认JavaScript没有被阻止

现在你的应用已经完全恢复正常，并且具备了完整的用户行为监控功能！