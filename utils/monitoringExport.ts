import MonitoringService from '../services/monitoringService';

export class MonitoringExport {
  private static monitoringService = MonitoringService.getInstance();

  // 导出监控数据为JSON
  static exportToJSON(): string {
    const data = this.monitoringService.getStoredData();
    const statistics = this.monitoringService.getStatistics();
    
    const exportData = {
      exportTime: new Date().toISOString(),
      statistics,
      sessions: data.sessions,
      summary: {
        totalSessions: data.sessions.length,
        dateRange: this.getDateRange(data.sessions),
        userCount: this.getUniqueUserCount(data.sessions)
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  // 导出监控数据为CSV
  static exportToCSV(): string {
    const data = this.monitoringService.getStoredData();
    const sessions = data.sessions;

    if (sessions.length === 0) {
      return 'No data available';
    }

    // CSV头部
    const headers = [
      'Session ID',
      'User ID',
      'Start Time',
      'End Time',
      'Duration (ms)',
      'Duration (formatted)',
      'Pages Visited',
      'Total Interactions'
    ];

    // CSV数据行
    const rows = sessions.map(session => {
      const totalInteractions = session.pages.reduce((sum, page) => sum + page.interactions, 0);
      
      return [
        session.sessionId,
        session.userId || 'Anonymous',
        new Date(session.startTime).toISOString(),
        session.endTime ? new Date(session.endTime).toISOString() : 'Ongoing',
        session.totalDuration,
        this.monitoringService.formatDuration(session.totalDuration),
        session.pages.length,
        totalInteractions
      ];
    });

    // 组合CSV内容
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // 导出页面访问详情为CSV
  static exportPageVisitsToCSV(): string {
    const data = this.monitoringService.getStoredData();
    const sessions = data.sessions;

    if (sessions.length === 0) {
      return 'No data available';
    }

    // CSV头部
    const headers = [
      'Session ID',
      'User ID',
      'Page Path',
      'Page Name',
      'Start Time',
      'End Time',
      'Duration (ms)',
      'Duration (formatted)',
      'Interactions'
    ];

    // CSV数据行
    const rows: string[][] = [];
    sessions.forEach(session => {
      session.pages.forEach(page => {
        rows.push([
          session.sessionId,
          session.userId || 'Anonymous',
          page.path,
          page.pageName,
          new Date(page.startTime).toISOString(),
          page.endTime ? new Date(page.endTime).toISOString() : 'Ongoing',
          page.duration.toString(),
          this.monitoringService.formatDuration(page.duration),
          page.interactions.toString()
        ]);
      });
    });

    // 组合CSV内容
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // 下载文件
  static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // 导出并下载JSON文件
  static downloadJSON(): void {
    const content = this.exportToJSON();
    const filename = `vita-me-monitoring-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(content, filename, 'application/json');
  }

  // 导出并下载CSV文件
  static downloadCSV(): void {
    const content = this.exportToCSV();
    const filename = `vita-me-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(content, filename, 'text/csv');
  }

  // 导出并下载页面访问CSV文件
  static downloadPageVisitsCSV(): void {
    const content = this.exportPageVisitsToCSV();
    const filename = `vita-me-page-visits-${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(content, filename, 'text/csv');
  }

  // 获取日期范围
  private static getDateRange(sessions: any[]): { start: string; end: string } {
    if (sessions.length === 0) {
      return { start: 'N/A', end: 'N/A' };
    }

    const startTimes = sessions.map(s => s.startTime);
    const endTimes = sessions.map(s => s.endTime || s.startTime);

    return {
      start: new Date(Math.min(...startTimes)).toISOString(),
      end: new Date(Math.max(...endTimes)).toISOString()
    };
  }

  // 获取唯一用户数量
  private static getUniqueUserCount(sessions: any[]): number {
    const userIds = new Set(sessions.map(s => s.userId).filter(Boolean));
    return userIds.size;
  }

  // 发送监控数据到服务器（如果需要）
  static async sendToServer(endpoint: string): Promise<boolean> {
    try {
      const data = this.exportToJSON();
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data
      });

      return response.ok;
    } catch (error) {
      console.error('发送监控数据失败:', error);
      return false;
    }
  }
}