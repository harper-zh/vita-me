import React, { useState, useEffect } from 'react';
import { Clock, Eye, BarChart3, Trash2, User, Activity, Download, FileText, Upload, Settings, Wifi, WifiOff } from 'lucide-react';
import { useMonitoring } from '../hooks/useMonitoring';
import { UserSession, PageVisit } from '../types';
import { MonitoringExport } from '../utils/monitoringExport';
import { BackendService } from '../services/backendService';

export const MonitoringPanel: React.FC = () => {
  const monitoring = useMonitoring();
  const [isVisible, setIsVisible] = useState(false);
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);
  const [currentPageVisit, setCurrentPageVisit] = useState<PageVisit | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [backendConfig, setBackendConfig] = useState({
    endpoint: '',
    apiKey: '',
    uploadInterval: 30
  });
  const [uploadStatus, setUploadStatus] = useState({
    isConfigured: false,
    isUploading: false,
    autoUploadEnabled: false
  });

  const backendService = BackendService.getInstance();

  // 定时更新数据
  useEffect(() => {
    const updateData = () => {
      setCurrentSession(monitoring.getCurrentSession());
      setCurrentPageVisit(monitoring.getCurrentPageVisit());
      setStatistics(monitoring.getStatistics());
      setUploadStatus(backendService.getUploadStatus());
    };

    updateData();
    const interval = setInterval(updateData, 1000);

    return () => clearInterval(interval);
  }, [monitoring, backendService]);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    } else {
      return `${seconds}s`;
    }
  };

  const getCurrentSessionDuration = (): number => {
    if (!currentSession) return 0;
    return Date.now() - currentSession.startTime;
  };

  const getCurrentPageDuration = (): number => {
    if (!currentPageVisit) return 0;
    return Date.now() - currentPageVisit.startTime;
  };

  const handleExport = (type: 'json' | 'csv' | 'pageVisits') => {
    switch (type) {
      case 'json':
        MonitoringExport.downloadJSON();
        break;
      case 'csv':
        MonitoringExport.downloadCSV();
        break;
      case 'pageVisits':
        MonitoringExport.downloadPageVisitsCSV();
        break;
    }
  };

  const handleConfigureBackend = () => {
    if (backendConfig.endpoint) {
      backendService.configure({
        endpoint: backendConfig.endpoint,
        apiKey: backendConfig.apiKey || undefined,
        uploadInterval: backendConfig.uploadInterval
      });
      setShowConfig(false);
      alert('后台服务配置成功！');
    } else {
      alert('请输入后台接口地址');
    }
  };

  const handleManualUpload = async () => {
    const success = await backendService.manualUpload();
    alert(success ? '数据上传成功！' : '数据上传失败，请检查配置');
  };

  const handleTestConnection = async () => {
    const success = await backendService.testConnection();
    alert(success ? '后台连接测试成功！' : '后台连接测试失败');
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
        title="打开监控面板"
      >
        <BarChart3 size={20} />
      </button>
    );
  }

  if (showConfig) {
    return (
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-4 w-80 z-50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Settings size={18} />
            后台配置
          </h3>
          <button
            onClick={() => setShowConfig(false)}
            className="text-gray-500 hover:text-gray-700 text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              后台接口地址 *
            </label>
            <input
              type="url"
              value={backendConfig.endpoint}
              onChange={(e) => setBackendConfig(prev => ({ ...prev, endpoint: e.target.value }))}
              placeholder="https://your-api.com/monitoring"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              API Key (可选)
            </label>
            <input
              type="password"
              value={backendConfig.apiKey}
              onChange={(e) => setBackendConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="输入API密钥"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              自动上传间隔 (分钟)
            </label>
            <input
              type="number"
              value={backendConfig.uploadInterval}
              onChange={(e) => setBackendConfig(prev => ({ ...prev, uploadInterval: parseInt(e.target.value) || 30 }))}
              min="1"
              max="1440"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleTestConnection}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              测试连接
            </button>
            <button
              onClick={handleConfigureBackend}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              保存配置
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <BarChart3 size={18} />
          用户监控面板
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* 后台连接状态 */}
      <div className="mb-4 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1">
            {uploadStatus.isConfigured ? (
              <Wifi size={12} className="text-green-500" />
            ) : (
              <WifiOff size={12} className="text-gray-400" />
            )}
            后台状态
          </span>
          <span className={uploadStatus.isConfigured ? 'text-green-600' : 'text-gray-400'}>
            {uploadStatus.isConfigured ? '已配置' : '未配置'}
          </span>
        </div>
        {uploadStatus.autoUploadEnabled && (
          <div className="text-xs text-blue-600 mt-1">
            自动上传已启用
          </div>
        )}
      </div>

      {/* 当前会话信息 */}
      {currentSession && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 flex items-center gap-2 mb-2">
            <User size={16} />
            当前会话
          </h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div className="flex justify-between">
              <span>用户ID:</span>
              <span className="font-mono text-xs">{currentSession.userId?.slice(-8) || '匿名'}</span>
            </div>
            <div className="flex justify-between">
              <span>会话时长:</span>
              <span className="font-mono">{formatDuration(getCurrentSessionDuration())}</span>
            </div>
            <div className="flex justify-between">
              <span>访问页面:</span>
              <span>{currentSession.pages.length}</span>
            </div>
          </div>
        </div>
      )}

      {/* 当前页面信息 */}
      {currentPageVisit && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <h4 className="font-medium text-green-800 flex items-center gap-2 mb-2">
            <Eye size={16} />
            当前页面
          </h4>
          <div className="text-sm text-green-700 space-y-1">
            <div className="flex justify-between">
              <span>页面:</span>
              <span>{currentPageVisit.pageName}</span>
            </div>
            <div className="flex justify-between">
              <span>停留时长:</span>
              <span className="font-mono">{formatDuration(getCurrentPageDuration())}</span>
            </div>
            <div className="flex justify-between">
              <span>交互次数:</span>
              <span>{currentPageVisit.interactions}</span>
            </div>
          </div>
        </div>
      )}

      {/* 统计信息 */}
      {statistics && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-800 flex items-center gap-2 mb-2">
            <Activity size={16} />
            总体统计
          </h4>
          <div className="text-sm text-purple-700 space-y-1">
            <div className="flex justify-between">
              <span>总会话数:</span>
              <span>{statistics.totalSessions}</span>
            </div>
            <div className="flex justify-between">
              <span>总使用时长:</span>
              <span className="font-mono">{formatDuration(statistics.totalTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>平均会话时长:</span>
              <span className="font-mono">{formatDuration(statistics.averageSessionTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>最常访问:</span>
              <span>{statistics.mostVisitedPage}</span>
            </div>
            <div className="flex justify-between">
              <span>总页面浏览:</span>
              <span>{statistics.totalPageViews}</span>
            </div>
          </div>
        </div>
      )}

      {/* 后台上传功能 */}
      <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
        <h4 className="font-medium text-indigo-800 mb-2 flex items-center gap-2">
          <Upload size={16} />
          后台上传
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setShowConfig(true)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Settings size={12} />
            配置
          </button>
          <button
            onClick={handleManualUpload}
            disabled={!uploadStatus.isConfigured || uploadStatus.isUploading}
            className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Upload size={12} />
            {uploadStatus.isUploading ? '上传中...' : '立即上传'}
          </button>
        </div>
      </div>

      {/* 数据导出功能 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
          <Download size={16} />
          数据导出
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleExport('json')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <FileText size={12} />
            JSON
          </button>
          <button
            onClick={() => handleExport('csv')}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <FileText size={12} />
            会话CSV
          </button>
          <button
            onClick={() => handleExport('pageVisits')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center justify-center gap-1 transition-colors col-span-2"
          >
            <FileText size={12} />
            页面访问CSV
          </button>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            monitoring.clearData();
            setStatistics(monitoring.getStatistics());
          }}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <Trash2 size={14} />
          清除数据
        </button>
      </div>
    </div>
  );
};