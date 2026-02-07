import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import MonitoringService from '../services/monitoringService';

interface UseMonitoringOptions {
  userId?: string;
  trackInteractions?: boolean;
}

export const useMonitoring = (options: UseMonitoringOptions = {}) => {
  const { userId, trackInteractions = true } = options;
  const location = useLocation();
  const monitoringService = useRef(MonitoringService.getInstance());
  const isInitialized = useRef(false);

  // 初始化监控
  useEffect(() => {
    if (!isInitialized.current) {
      monitoringService.current.startSession(userId);
      isInitialized.current = true;

      // 页面卸载时结束会话
      const handleBeforeUnload = () => {
        monitoringService.current.endCurrentSession();
      };

      // 页面隐藏时结束当前页面访问
      const handleVisibilityChange = () => {
        if (document.hidden) {
          monitoringService.current.endCurrentPageVisit();
        } else {
          // 页面重新可见时开始新的页面访问
          monitoringService.current.startPageVisit(location.pathname);
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        monitoringService.current.endCurrentSession();
      };
    }
  }, [userId]);

  // 路由变化时记录页面访问
  useEffect(() => {
    if (isInitialized.current) {
      monitoringService.current.startPageVisit(location.pathname);
    }
  }, [location.pathname]);

  // 设置交互监听
  useEffect(() => {
    if (!trackInteractions) return;

    const handleInteraction = () => {
      monitoringService.current.recordInteraction();
    };

    // 监听各种用户交互
    const events = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleInteraction);
      });
    };
  }, [trackInteractions]);

  return {
    recordInteraction: () => monitoringService.current.recordInteraction(),
    getCurrentSession: () => monitoringService.current.getCurrentSession(),
    getCurrentPageVisit: () => monitoringService.current.getCurrentPageVisit(),
    getStatistics: () => monitoringService.current.getStatistics(),
    clearData: () => monitoringService.current.clearData()
  };
};