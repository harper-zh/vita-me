import MonitoringService from '../services/monitoringService';
import { BackendService } from '../services/backendService';
import { UserManager } from './userUtils';

// 静默监控系统 - 无UI，纯后台运行
export class SilentMonitoring {
  private static instance: SilentMonitoring;
  private monitoringService: MonitoringService;
  private backendService: BackendService;
  private isInitialized = false;

  private constructor() {
    this.monitoringService = MonitoringService.getInstance();
    this.backendService = BackendService.getInstance();
  }

  static getInstance(): SilentMonitoring {
    if (!SilentMonitoring.instance) {
      SilentMonitoring.instance = new SilentMonitoring();
    }
    return SilentMonitoring.instance;
  }

  // 初始化静默监控
  init(config?: {
    backendEndpoint?: string;
    apiKey?: string;
    uploadInterval?: number;
    enableConsoleLog?: boolean;
  }) {
    if (this.isInitialized) return;

    const {
      backendEndpoint = 'http://localhost:3001/api/monitoring',
      apiKey,
      uploadInterval = 30,
      enableConsoleLog = false
    } = config || {};

    // 禁用控制台日志（如果需要）
    if (!enableConsoleLog) {
      this.disableConsoleLogs();
    }

    // 获取用户ID
    const userId = UserManager.getUserId();

    // 启动监控会话（暂时不传 vitaMeId，稍后通过全局函数设置）
    this.monitoringService.startSession(userId);

    // 配置后台服务
    this.backendService.configure({
      endpoint: backendEndpoint,
      apiKey,
      uploadInterval
    });

    // 监听页面路由变化
    this.setupRouteMonitoring();

    // 监听用户交互
    this.setupInteractionMonitoring();

    // 监听页面卸载
    this.setupUnloadMonitoring();

    // 设置全局函数来更新 Vita-Me ID
    this.setupGlobalFunctions();

    this.isInitialized = true;
  }

  // 设置全局函数
  private setupGlobalFunctions() {
    // 设置 Vita-Me ID 的全局函数
    (window as any).setVitaMeId = (vitaMeId: string) => {
      const currentSession = this.monitoringService.getCurrentSession();
      if (currentSession) {
        (currentSession as any).vitaMeId = vitaMeId;
        console.log('🆔 Vita-Me ID 已设置:', vitaMeId);
      }
    };
  }

  // 禁用控制台日志
  private disableConsoleLogs() {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error
    };

    // 过滤监控相关的日志
    console.log = (...args) => {
      const message = args.join(' ');
      if (!message.includes('🔍') && !message.includes('📊') && !message.includes('✅') && !message.includes('❌')) {
        originalConsole.log(...args);
      }
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      if (!message.includes('监控') && !message.includes('上传')) {
        originalConsole.warn(...args);
      }
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (!message.includes('监控') && !message.includes('上传')) {
        originalConsole.error(...args);
      }
    };
  }

  // 设置路由监控
  private setupRouteMonitoring() {
    let currentPath = window.location.hash.replace('#', '') || '/';
    this.monitoringService.startPageVisit(currentPath);

    // 监听路由变化
    const checkRouteChange = () => {
      const newPath = window.location.hash.replace('#', '') || '/';
      if (newPath !== currentPath) {
        this.monitoringService.startPageVisit(newPath);
        currentPath = newPath;
      }
    };

    window.addEventListener('hashchange', checkRouteChange);
    
    // 定期检查路由变化（防止某些情况下hashchange不触发）
    setInterval(checkRouteChange, 1000);
  }

  // 设置交互监控
  private setupInteractionMonitoring() {
    const events = ['click', 'scroll', 'keydown', 'mousemove', 'touchstart'];
    
    const handleInteraction = () => {
      this.monitoringService.recordInteraction();
    };

    events.forEach(event => {
      document.addEventListener(event, handleInteraction, { 
        passive: true,
        capture: false 
      });
    });
  }

  // 设置页面卸载监控
  private setupUnloadMonitoring() {
    // 页面卸载时结束会话并上传数据
    window.addEventListener('beforeunload', () => {
      this.monitoringService.endCurrentSession();
      // 尝试同步上传（可能不会完成）
      this.backendService.manualUpload();
    });

    // 页面隐藏时结束当前页面访问
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.monitoringService.endCurrentPageVisit();
        // 页面隐藏时上传数据
        this.backendService.manualUpload();
      } else {
        // 页面重新可见时开始新的页面访问
        const currentPath = window.location.hash.replace('#', '') || '/';
        this.monitoringService.startPageVisit(currentPath);
      }
    });
  }

  // 手动上传数据（供外部调用）
  async uploadData(): Promise<boolean> {
    return await this.backendService.manualUpload();
  }

  // 获取统计数据（供外部调用）
  getStatistics() {
    return this.monitoringService.getStatistics();
  }

  // 清除数据（供外部调用）
  clearData() {
    this.monitoringService.clearData();
  }

  // 检查是否已初始化
  isReady(): boolean {
    return this.isInitialized;
  }
}

// 全局函数（供控制台调用）
(window as any).vitaMonitoring = {
  upload: () => SilentMonitoring.getInstance().uploadData(),
  stats: () => SilentMonitoring.getInstance().getStatistics(),
  clear: () => SilentMonitoring.getInstance().clearData(),
  isReady: () => SilentMonitoring.getInstance().isReady(),
  setVitaMeId: (vitaMeId: string) => {
    (window as any).setVitaMeId(vitaMeId);
  }
};