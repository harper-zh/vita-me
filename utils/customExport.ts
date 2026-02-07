import MonitoringService from '../services/monitoringService';

export interface UserStayData {
  vitaMeId: string;
  stayTime: number; // 毫秒
  stayTimeFormatted: string; // 格式化的时间
  sessionCount: number; // 会话数量
  pageViews: number; // 页面浏览数
}

export class CustomExport {
  private static monitoringService = MonitoringService.getInstance();

  // 导出用户停留时间数据
  static exportUserStayData(): UserStayData[] {
    const data = this.monitoringService.getStoredData();
    const sessions = data.sessions;

    if (sessions.length === 0) {
      return [];
    }

    // 按 Vita-Me ID 分组统计
    const userStats: { [vitaMeId: string]: UserStayData } = {};

    sessions.forEach(session => {
      const vitaMeId = (session as any).vitaMeId || '匿名用户';
      
      if (!userStats[vitaMeId]) {
        userStats[vitaMeId] = {
          vitaMeId,
          stayTime: 0,
          stayTimeFormatted: '',
          sessionCount: 0,
          pageViews: 0
        };
      }

      userStats[vitaMeId].stayTime += session.totalDuration;
      userStats[vitaMeId].sessionCount += 1;
      userStats[vitaMeId].pageViews += session.pages.length;
    });

    // 格式化时间并转换为数组
    const result = Object.values(userStats).map(user => ({
      ...user,
      stayTimeFormatted: this.formatDuration(user.stayTime)
    }));

    // 按停留时间降序排序
    return result.sort((a, b) => b.stayTime - a.stayTime);
  }

  // 导出为 JSON 格式
  static exportUserStayDataAsJSON(): string {
    const data = this.exportUserStayData();
    
    const exportData = {
      exportTime: new Date().toISOString(),
      totalUsers: data.length,
      users: data
    };

    return JSON.stringify(exportData, null, 2);
  }

  // 导出为 CSV 格式
  static exportUserStayDataAsCSV(): string {
    const data = this.exportUserStayData();

    if (data.length === 0) {
      return 'No data available';
    }

    // CSV 头部
    const headers = [
      'Vita-Me ID',
      '停留时间(毫秒)',
      '停留时间(格式化)',
      '会话数量',
      '页面浏览数'
    ];

    // CSV 数据行
    const rows = data.map(user => [
      user.vitaMeId,
      user.stayTime.toString(),
      user.stayTimeFormatted,
      user.sessionCount.toString(),
      user.pageViews.toString()
    ]);

    // 组合 CSV 内容
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  // 导出简化版本（只包含用户名和停留时间）
  static exportSimpleUserData(): { vitaMeId: string; stayTime: string }[] {
    const data = this.exportUserStayData();
    
    return data.map(user => ({
      vitaMeId: user.vitaMeId,
      stayTime: user.stayTimeFormatted
    }));
  }

  // 导出简化版本为 JSON
  static exportSimpleUserDataAsJSON(): string {
    const data = this.exportSimpleUserData();
    
    const exportData = {
      exportTime: new Date().toISOString(),
      format: "简化版用户停留时间数据",
      users: data
    };

    return JSON.stringify(exportData, null, 2);
  }

  // 格式化时长
  private static formatDuration(ms: number): string {
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

  // 下载文件
  private static downloadFile(content: string, filename: string, mimeType: string = 'text/plain'): void {
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

  // 下载用户停留时间数据（JSON格式）
  static downloadUserStayDataJSON(): void {
    const content = this.exportUserStayDataAsJSON();
    const filename = `用户停留时间-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(content, filename, 'application/json');
  }

  // 下载用户停留时间数据（CSV格式）
  static downloadUserStayDataCSV(): void {
    const content = this.exportUserStayDataAsCSV();
    const filename = `用户停留时间-${new Date().toISOString().split('T')[0]}.csv`;
    this.downloadFile(content, filename, 'text/csv');
  }

  // 下载简化版数据（JSON格式）
  static downloadSimpleUserDataJSON(): void {
    const content = this.exportSimpleUserDataAsJSON();
    const filename = `用户停留时间-简化版-${new Date().toISOString().split('T')[0]}.json`;
    this.downloadFile(content, filename, 'application/json');
  }
}

// 添加到全局函数中
(window as any).vitaExport = {
  downloadUserStayJSON: () => CustomExport.downloadUserStayDataJSON(),
  downloadUserStayCSV: () => CustomExport.downloadUserStayDataCSV(),
  downloadSimpleJSON: () => CustomExport.downloadSimpleUserDataJSON(),
  getUserData: () => CustomExport.exportUserStayData(),
  getSimpleData: () => CustomExport.exportSimpleUserData()
};