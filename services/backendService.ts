import MonitoringService from './monitoringService';
import { MonitoringExport } from '../utils/monitoringExport';

export interface BackendConfig {
  endpoint: string;
  apiKey?: string;
  batchSize?: number;
  uploadInterval?: number; // 分钟
}

export class BackendService {
  private static instance: BackendService;
  private config: BackendConfig | null = null;
  private uploadTimer: NodeJS.Timeout | null = null;
  private isUploading = false;

  static getInstance(): BackendService {
    if (!BackendService.instance) {
      BackendService.instance = new BackendService();
    }
    return BackendService.instance;
  }

  // 配置后台服务
  configure(config: BackendConfig): void {
    this.config = config;
    console.log('🔧 后台服务已配置:', config.endpoint);
    
    // 如果设置了自动上传间隔，启动定时上传
    if (config.uploadInterval && config.uploadInterval > 0) {
      this.startAutoUpload(config.uploadInterval);
    }
  }

  // 启动自动上传
  private startAutoUpload(intervalMinutes: number): void {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer);
    }

    this.uploadTimer = setInterval(() => {
      this.uploadMonitoringData();
    }, intervalMinutes * 60 * 1000);

    console.log(`⏰ 自动上传已启动，间隔: ${intervalMinutes}分钟`);
  }

  // 停止自动上传
  stopAutoUpload(): void {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer);
      this.uploadTimer = null;
      console.log('⏹️ 自动上传已停止');
    }
  }

  // 上传监控数据到后台
  async uploadMonitoringData(): Promise<boolean> {
    if (!this.config) {
      console.error('❌ 后台服务未配置');
      return false;
    }

    if (this.isUploading) {
      console.log('⏳ 正在上传中，跳过本次上传');
      return false;
    }

    try {
      this.isUploading = true;
      console.log('📤 开始上传监控数据...');

      const monitoringService = MonitoringService.getInstance();
      const data = monitoringService.getStoredData();
      const statistics = monitoringService.getStatistics();

      if (data.sessions.length === 0) {
        console.log('📭 没有监控数据需要上传');
        return true;
      }

      // 准备上传数据
      const uploadData = {
        timestamp: new Date().toISOString(),
        appName: 'vita-me',
        version: '1.0.0',
        statistics,
        sessions: data.sessions,
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          screenResolution: `${screen.width}x${screen.height}`,
          uploadSource: 'auto'
        }
      };

      // 发送到后台
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(uploadData)
      });

      if (response.ok) {
        console.log('✅ 监控数据上传成功');
        
        // 上传成功后清除本地数据（可选）
        // monitoringService.clearData();
        
        return true;
      } else {
        console.error('❌ 上传失败:', response.status, response.statusText);
        return false;
      }

    } catch (error) {
      console.error('❌ 上传监控数据时发生错误:', error);
      return false;
    } finally {
      this.isUploading = false;
    }
  }

  // 手动触发上传
  async manualUpload(): Promise<boolean> {
    console.log('👆 手动触发数据上传');
    return await this.uploadMonitoringData();
  }

  // 上传特定会话数据
  async uploadSession(sessionId: string): Promise<boolean> {
    if (!this.config) {
      console.error('❌ 后台服务未配置');
      return false;
    }

    try {
      const monitoringService = MonitoringService.getInstance();
      const data = monitoringService.getStoredData();
      const session = data.sessions.find(s => s.sessionId === sessionId);

      if (!session) {
        console.error('❌ 找不到指定的会话:', sessionId);
        return false;
      }

      const uploadData = {
        timestamp: new Date().toISOString(),
        appName: 'vita-me',
        version: '1.0.0',
        session,
        metadata: {
          userAgent: navigator.userAgent,
          language: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          uploadSource: 'manual'
        }
      };

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(uploadData)
      });

      if (response.ok) {
        console.log('✅ 会话数据上传成功:', sessionId);
        return true;
      } else {
        console.error('❌ 会话上传失败:', response.status, response.statusText);
        return false;
      }

    } catch (error) {
      console.error('❌ 上传会话数据时发生错误:', error);
      return false;
    }
  }

  // 获取上传状态
  getUploadStatus(): { isConfigured: boolean; isUploading: boolean; autoUploadEnabled: boolean } {
    return {
      isConfigured: !!this.config,
      isUploading: this.isUploading,
      autoUploadEnabled: !!this.uploadTimer
    };
  }

  // 测试后台连接
  async testConnection(): Promise<boolean> {
    if (!this.config) {
      console.error('❌ 后台服务未配置');
      return false;
    }

    try {
      // 使用GET请求测试健康检查接口
      const healthEndpoint = this.config.endpoint.replace('/api/monitoring', '/api/health');
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      const isConnected = response.ok;
      console.log(isConnected ? '✅ 后台连接测试成功' : '❌ 后台连接测试失败');
      return isConnected;

    } catch (error) {
      console.error('❌ 后台连接测试失败:', error);
      return false;
    }
  }

  // 获取配置
  getConfig(): BackendConfig | null {
    return this.config;
  }
}