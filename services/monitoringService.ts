import { UserSession, PageVisit, MonitoringData } from '../types';

class MonitoringService {
  private static instance: MonitoringService;
  private currentSession: UserSession | null = null;
  private currentPageVisit: PageVisit | null = null;
  private storageKey = 'vita-me-monitoring';

  static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  // 生成唯一会话ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取页面名称
  private getPageName(path: string): string {
    const pageNames: Record<string, string> = {
      '/': '首页',
      '/result': '结果页',
      '/daily': '每日运势'
    };
    return pageNames[path] || '未知页面';
  }

  // 开始新会话
  startSession(userId?: string, vitaMeId?: string): void {
    this.endCurrentSession();
    
    this.currentSession = {
      userId,
      vitaMeId, // 添加 Vita-Me ID
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      totalDuration: 0,
      pages: []
    };

    console.log('🔍 监控会话开始:', this.currentSession.sessionId, 'Vita-Me ID:', vitaMeId);
  }

  // 结束当前会话
  endCurrentSession(): void {
    if (this.currentSession) {
      this.endCurrentPageVisit();
      this.currentSession.endTime = Date.now();
      this.currentSession.totalDuration = this.currentSession.endTime - this.currentSession.startTime;
      
      this.saveSession(this.currentSession);
      console.log('🔍 监控会话结束:', this.currentSession.sessionId, '总时长:', this.formatDuration(this.currentSession.totalDuration));
      
      this.currentSession = null;
    }
  }

  // 开始页面访问
  startPageVisit(path: string): void {
    if (!this.currentSession) {
      this.startSession();
    }

    this.endCurrentPageVisit();

    this.currentPageVisit = {
      path,
      pageName: this.getPageName(path),
      startTime: Date.now(),
      duration: 0,
      interactions: 0
    };

    console.log('📄 页面访问开始:', this.currentPageVisit.pageName);
  }

  // 结束当前页面访问
  endCurrentPageVisit(): void {
    if (this.currentPageVisit && this.currentSession) {
      this.currentPageVisit.endTime = Date.now();
      this.currentPageVisit.duration = this.currentPageVisit.endTime - this.currentPageVisit.startTime;
      
      this.currentSession.pages.push({ ...this.currentPageVisit });
      console.log('📄 页面访问结束:', this.currentPageVisit.pageName, '停留时长:', this.formatDuration(this.currentPageVisit.duration));
      
      this.currentPageVisit = null;
    }
  }

  // 记录用户交互
  recordInteraction(): void {
    if (this.currentPageVisit) {
      this.currentPageVisit.interactions++;
    }
  }

  // 保存会话到本地存储
  private saveSession(session: UserSession): void {
    try {
      const existingData = this.getStoredData();
      existingData.sessions.push(session);
      
      // 只保留最近50个会话
      if (existingData.sessions.length > 50) {
        existingData.sessions = existingData.sessions.slice(-50);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(existingData));
    } catch (error) {
      console.error('保存监控数据失败:', error);
    }
  }

  // 获取存储的数据
  getStoredData(): MonitoringData {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { sessions: [] };
    } catch (error) {
      console.error('读取监控数据失败:', error);
      return { sessions: [] };
    }
  }

  // 获取当前会话信息
  getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  // 获取当前页面访问信息
  getCurrentPageVisit(): PageVisit | null {
    return this.currentPageVisit;
  }

  // 格式化时长
  formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟${seconds % 60}秒`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  }

  // 获取统计数据
  getStatistics() {
    const data = this.getStoredData();
    const sessions = data.sessions;

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        averageSessionTime: 0,
        mostVisitedPage: '无',
        totalPageViews: 0
      };
    }

    const totalTime = sessions.reduce((sum, session) => sum + session.totalDuration, 0);
    const totalPageViews = sessions.reduce((sum, session) => sum + session.pages.length, 0);
    
    // 统计页面访问次数
    const pageVisits: Record<string, number> = {};
    sessions.forEach(session => {
      session.pages.forEach(page => {
        pageVisits[page.pageName] = (pageVisits[page.pageName] || 0) + 1;
      });
    });

    const mostVisitedPage = Object.keys(pageVisits).reduce((a, b) => 
      pageVisits[a] > pageVisits[b] ? a : b, '无'
    );

    return {
      totalSessions: sessions.length,
      totalTime,
      averageSessionTime: totalTime / sessions.length,
      mostVisitedPage,
      totalPageViews,
      pageVisits
    };
  }

  // 清除所有数据
  clearData(): void {
    localStorage.removeItem(this.storageKey);
    console.log('🗑️ 监控数据已清除');
  }
}

export default MonitoringService;