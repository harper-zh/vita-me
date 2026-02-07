# 用户监控系统使用指南

## 概述

已为你的"唯她命"应用添加了完整的用户监控系统，可以记录用户在页面上的停留时间、交互行为和会话信息。

## 功能特性

### 🔍 自动监控
- **会话跟踪**: 自动为每个用户创建唯一会话ID
- **页面访问**: 记录用户访问的每个页面及停留时间
- **用户交互**: 统计点击、滚动、键盘输入等交互次数
- **用户身份**: 支持匿名用户和登录用户的区分

### 📊 实时统计
- 当前会话时长
- 当前页面停留时间
- 总体使用统计
- 页面访问热度分析

### 💾 数据存储
- 本地存储（localStorage）
- 自动清理旧数据（保留最近50个会话）
- 数据持久化，浏览器重启后保留

### 📤 数据导出
- JSON格式：完整的监控数据
- CSV格式：会话统计数据
- CSV格式：页面访问详情

## 使用方法

### 开发环境
在开发环境中，你会看到右下角的监控面板按钮：

1. **点击蓝色圆形按钮**打开监控面板
2. **查看实时数据**：当前会话、页面访问、统计信息
3. **导出数据**：点击相应按钮下载监控数据
4. **清除数据**：清空所有历史监控数据

### 生产环境
在生产环境中，监控系统在后台静默运行，不显示面板。

## 技术实现

### 核心组件

1. **MonitoringService** (`services/monitoringService.ts`)
   - 单例模式的监控服务
   - 管理会话和页面访问数据
   - 提供统计分析功能

2. **useMonitoring Hook** (`hooks/useMonitoring.ts`)
   - React Hook，自动初始化监控
   - 监听路由变化和用户交互
   - 处理页面可见性变化

3. **UserManager** (`utils/userUtils.ts`)
   - 用户身份管理
   - 自动生成或获取用户ID
   - 支持登录用户信息存储

4. **MonitoringExport** (`utils/monitoringExport.ts`)
   - 数据导出功能
   - 支持多种格式导出
   - 可发送数据到服务器

### 数据结构

```typescript
interface UserSession {
  userId?: string;          // 用户ID（可选）
  sessionId: string;        // 会话ID
  startTime: number;        // 会话开始时间
  endTime?: number;         // 会话结束时间
  totalDuration: number;    // 总时长
  pages: PageVisit[];       // 页面访问记录
}

interface PageVisit {
  path: string;            // 页面路径
  pageName: string;        // 页面名称
  startTime: number;       // 访问开始时间
  endTime?: number;        // 访问结束时间
  duration: number;        // 停留时长
  interactions: number;    // 交互次数
}
```

## 自定义配置

### 设置用户ID
如果你有登录系统，可以这样设置用户ID：

```typescript
import { UserManager } from './utils/userUtils';

// 用户登录后
UserManager.setUserId('user123');
UserManager.setUserInfo({
  username: 'john_doe',
  email: 'john@example.com',
  isLoggedIn: true
});
```

### 禁用交互跟踪
```typescript
// 在App.tsx中修改
useMonitoring({ 
  userId, 
  trackInteractions: false  // 禁用交互跟踪
});
```

### 发送数据到服务器
```typescript
import { MonitoringExport } from './utils/monitoringExport';

// 发送监控数据到你的服务器
const success = await MonitoringExport.sendToServer('https://your-api.com/monitoring');
```

## 隐私和安全

- 所有数据存储在用户本地浏览器中
- 不会自动发送数据到外部服务器
- 用户可以随时清除监控数据
- 支持匿名用户，不强制收集个人信息

## 性能影响

- 监控系统设计为轻量级，对应用性能影响极小
- 使用防抖和节流技术优化事件监听
- 数据存储使用异步操作，不阻塞UI

## 故障排除

### 监控面板不显示
- 确保在开发环境中运行 (`NODE_ENV === 'development'`)
- 检查浏览器控制台是否有错误

### 数据不保存
- 检查浏览器是否禁用了localStorage
- 确保有足够的存储空间

### 导出功能不工作
- 检查浏览器是否阻止了文件下载
- 确保有监控数据可导出

## 扩展功能

你可以根据需要扩展监控系统：

1. **添加更多事件跟踪**
2. **集成第三方分析服务**
3. **添加实时数据可视化**
4. **实现数据自动上传**
5. **添加用户行为热力图**

监控系统已完全集成到你的应用中，现在可以开始收集用户行为数据了！