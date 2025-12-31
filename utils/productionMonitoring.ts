import { BackendService } from '../services/backendService';
import { UserManager } from './userUtils';

// 生产环境监控配置
export const initProductionMonitoring = () => {
  // 只在生产环境启用
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  console.log('🚀 初始化生产环境监控系统...');

  // 配置后台服务（你需要替换为实际的后台地址）
  const backendService = BackendService.getInstance();
  
  // 从环境变量或配置中读取后台地址
  const backendEndpoint = process.env.REACT_APP_MONITORING_ENDPOINT || 
                          'https://your-backend.com/api/monitoring';
  
  const apiKey = process.env.REACT_APP_MONITORING_API_KEY;

  backendService.configure({
    endpoint: backendEndpoint,
    apiKey,
    uploadInterval: 30 // 每30分钟自动上传一次
  });

  // 页面卸载时上传数据
  window.addEventListener('beforeunload', () => {
    backendService.manualUpload();
  });

  // 页面隐藏时上传数据（移动端切换应用）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      backendService.manualUpload();
    }
  });

  console.log('✅ 生产环境监控系统初始化完成');
};

// 手动触发数据上传的全局函数
(window as any).uploadMonitoringData = () => {
  const backendService = BackendService.getInstance();
  return backendService.manualUpload();
};

// 获取监控统计的全局函数
(window as any).getMonitoringStats = () => {
  const MonitoringService = require('../services/monitoringService').default;
  const service = MonitoringService.getInstance();
  return service.getStatistics();
};