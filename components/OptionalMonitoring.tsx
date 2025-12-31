import React, { useState, useEffect } from 'react';
import { BarChart3, Settings, Upload, Download, Trash2, Wifi, WifiOff } from 'lucide-react';
import { MonitoringExport } from '../utils/monitoringExport';
import { BackendService } from '../services/backendService';
import MonitoringService from '../services/monitoringService';
import { UserManager } from '../utils/userUtils';

// 独立的监控组件，不会影响主应用功能
export const OptionalMonitoring: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [statistics, setStatistics] = useState<any>(null);
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

  const monitoringService = MonitoringService.getInstance();
  const backendService = BackendService.getInstance();

  // 启用监控
  const enableMonitoring = () => {
    if (!isEnabled) {
      const userId = UserManager.getUserId();
      monitoringService.startSession(userId);
      setIsEnabled(true);
      console.log('🔍 监控系统已启用');
    }
  };

  // 禁用监控
  const disableMonitoring = () => {
    if (isEnabled) {
      monitoringService.endCurrentSession();
      setIsEnabled(false);
      console.log('🔍 监控系统已禁用');
    }
  };

  // 更新统计数据
  const updateStatistics = () => {
    setStatistics(monitoringService.getStatistics());
    setUploadStatus(backendService.getUploadStatus());
  };

  useEffect(() => {
    if (isEnabled) {
      const interval = setInterval(updateStatistics, 2000);
      return () => clearInterval(interval);
    }
  }, [isEnabled]);

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

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 bg-purple-500 hover:bg-purple-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-40"
        title="打开可选监控面板"
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
              placeholder="http://localhost:3001/api/monitoring"
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm transition-colors"
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
          可选监控面板
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* 监控开关 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">监控状态</span>
          <button
            onClick={isEnabled ? disableMonitoring : enableMonitoring}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              isEnabled 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            {isEnabled ? '已启用' : '已禁用'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {isEnabled ? '正在收集用户行为数据' : '不会影响应用正常功能'}
        </p>
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
      </div>

      {/* 统计信息 */}
      {isEnabled && statistics && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <h4 className="font-medium text-purple-800 mb-2">统计数据</h4>
          <div className="text-sm text-purple-700 space-y-1">
            <div className="flex justify-between">
              <span>总会话数:</span>
              <span>{statistics.totalSessions}</span>
            </div>
            <div className="flex justify-between">
              <span>总时长:</span>
              <span>{formatDuration(statistics.totalTime)}</span>
            </div>
            <div className="flex justify-between">
              <span>页面浏览:</span>
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
            {uploadStatus.isUploading ? '上传中...' : '上传'}
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
            onClick={() => MonitoringExport.downloadJSON()}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            JSON
          </button>
          <button
            onClick={() => MonitoringExport.downloadCSV()}
            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            CSV
          </button>
        </div>
      </div>

      {/* 清除数据 */}
      <button
        onClick={() => {
          monitoringService.clearData();
          updateStatistics();
        }}
        className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-2 transition-colors"
      >
        <Trash2 size={14} />
        清除数据
      </button>
    </div>
  );
};