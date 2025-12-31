import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, Users, Clock, FileText, BarChart3, RefreshCw } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';

interface BackendUserData {
  vitaMeId: string;
  stayTime: number;
  stayTimeFormatted: string;
  sessionCount: number;
  pageViews: number;
}

const DataExport: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<BackendUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadBackendData();
  }, []);

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}小时${minutes % 60}分钟`;
    } else if (minutes > 0) {
      return `${minutes}分钟${seconds % 60}秒`;
    } else {
      return `${seconds}秒`;
    }
  };

  // 从后台加载真实数据
  const loadBackendData = async () => {
    setLoading(true);
    try {
      // 直接读取最新的监控文件
      const fileResponse = await fetch(`http://localhost:3001/api/monitoring/file/monitoring-latest.json`);
      
      if (!fileResponse.ok) {
        // 如果最新文件不存在，尝试获取文件列表
        const listResponse = await fetch('http://localhost:3001/api/monitoring/list');
        const listData = await listResponse.json();
        
        if (!listData.success || listData.files.length === 0) {
          setUserData([]);
          setTotalUsers(0);
          setTotalTime(0);
          setLastUpdate('无数据');
          return;
        }

        // 获取最新的监控文件
        const latestFile = listData.files[0];
        const fallbackResponse = await fetch(`http://localhost:3001/api/monitoring/file/${latestFile.filename}`);
        
        if (!fallbackResponse.ok) {
          throw new Error('无法获取监控数据文件');
        }
        
        const monitoringData = await fallbackResponse.json();
        processMonitoringData(monitoringData, new Date(latestFile.created).toLocaleString('zh-CN'));
      } else {
        const monitoringData = await fileResponse.json();
        processMonitoringData(monitoringData, '实时数据');
      }

    } catch (error) {
      console.error('加载后台数据失败:', error);
      setUserData([]);
      setTotalUsers(0);
      setTotalTime(0);
      setLastUpdate('加载失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理监控数据
  const processMonitoringData = (monitoringData: any, updateTime: string) => {
    // 处理数据，按 vitaMeId 分组
    const userStats: { [vitaMeId: string]: BackendUserData } = {};
    
    monitoringData.sessions.forEach((session: any) => {
      const vitaMeId = session.vitaMeId || '匿名用户';
      
      if (!userStats[vitaMeId]) {
        userStats[vitaMeId] = {
          vitaMeId,
          stayTime: 0,
          stayTimeFormatted: '',
          sessionCount: 0,
          pageViews: 0
        };
      }

      userStats[vitaMeId].stayTime += session.totalDuration || 0;
      userStats[vitaMeId].sessionCount += 1;
      userStats[vitaMeId].pageViews += session.pages?.length || 0;
    });

    // 格式化数据
    const processedData = Object.values(userStats).map(user => ({
      ...user,
      stayTimeFormatted: formatDuration(user.stayTime)
    })).sort((a, b) => b.stayTime - a.stayTime);

    setUserData(processedData);
    setTotalUsers(processedData.length);
    setTotalTime(processedData.reduce((sum, user) => sum + user.stayTime, 0));
    setLastUpdate(updateTime);
  };

  // 清空后台数据
  const handleClearBackendData = async () => {
    if (!confirm('确定要清空所有后台监控数据吗？此操作不可恢复！')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/monitoring/clear', {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`成功清空 ${result.deletedCount} 个监控数据文件`);
        // 重新加载数据
        loadBackendData();
      } else {
        alert('清空失败：' + result.error);
      }
    } catch (error) {
      console.error('清空后台数据失败:', error);
      alert('清空失败，请检查后台服务器是否正常运行');
    }
  };

  const handleExport = (format: 'simple-json' | 'detailed-json' | 'csv') => {
    try {
      const exportData = {
        exportTime: new Date().toISOString(),
        lastUpdate,
        totalUsers,
        users: userData.map(user => ({
          vitaMeId: user.vitaMeId,
          stayTime: user.stayTimeFormatted
        }))
      };

      let content = '';
      let filename = '';
      let mimeType = '';

      switch (format) {
        case 'simple-json':
          content = JSON.stringify({
            exportTime: exportData.exportTime,
            format: "简化版用户停留时间数据",
            lastUpdate: exportData.lastUpdate,
            users: exportData.users
          }, null, 2);
          filename = `用户停留时间-简化版-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
          
        case 'detailed-json':
          content = JSON.stringify({
            exportTime: exportData.exportTime,
            format: "详细版用户停留时间数据",
            lastUpdate: exportData.lastUpdate,
            totalUsers: exportData.totalUsers,
            users: userData
          }, null, 2);
          filename = `用户停留时间-详细版-${new Date().toISOString().split('T')[0]}.json`;
          mimeType = 'application/json';
          break;
          
        case 'csv':
          const headers = ['Vita-Me ID', '停留时间(格式化)', '会话数量', '页面浏览数'];
          const rows = userData.map(user => [
            user.vitaMeId,
            user.stayTimeFormatted,
            user.sessionCount.toString(),
            user.pageViews.toString()
          ]);
          content = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');
          filename = `用户停留时间-${new Date().toISOString().split('T')[0]}.csv`;
          mimeType = 'text/csv';
          break;
      }

      // 下载文件
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-paper p-4 pb-24 md:p-8">
      <header className="flex items-center justify-between mb-8 max-w-4xl mx-auto pt-4">
        <button 
          onClick={() => navigate('/')} 
          className="p-2 hover:bg-white/50 rounded-full transition-all"
        >
          <ChevronLeft className="text-sage-600" />
        </button>
        <h2 className="text-xl font-serif-sc text-sage-600 font-bold tracking-widest">数据导出</h2>
        <div className="w-10" />
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* 数据来源说明 */}
        <GlassCard className="bg-blue-50 border-blue-200">
          <div className="p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">数据来源</h3>
            <p className="text-xs text-blue-700">
              数据来源：后台监控服务器 (http://localhost:3001)
            </p>
            <p className="text-xs text-blue-600 mt-1">
              最后更新：{lastUpdate}
            </p>
          </div>
        </GlassCard>

        {/* 统计概览 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="text-center">
            <div className="p-4">
              <Users className="mx-auto mb-2 text-primary" size={24} />
              <p className="text-2xl font-bold text-sage-600">{totalUsers}</p>
              <p className="text-sm text-gray-500">总用户数</p>
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="p-4">
              <Clock className="mx-auto mb-2 text-accent" size={24} />
              <p className="text-2xl font-bold text-sage-600">{formatDuration(totalTime)}</p>
              <p className="text-sm text-gray-500">总停留时间</p>
            </div>
          </GlassCard>
          
          <GlassCard className="text-center">
            <div className="p-4">
              <BarChart3 className="mx-auto mb-2 text-indigo-500" size={24} />
              <p className="text-2xl font-bold text-sage-600">
                {totalUsers > 0 ? formatDuration(totalTime / totalUsers) : '0秒'}
              </p>
              <p className="text-sm text-gray-500">平均停留时间</p>
            </div>
          </GlassCard>
        </section>

        {/* 导出按钮 */}
        <GlassCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-serif-sc text-sage-600 font-bold flex items-center gap-2">
                <Download size={20} />
                数据导出
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearBackendData}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors px-3 py-1 border border-red-200 rounded hover:bg-red-50"
                >
                  🗑️ 清空后台数据
                </button>
                <button
                  onClick={loadBackendData}
                  disabled={loading}
                  className="flex items-center gap-2 text-sm text-primary hover:text-sage-600 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  刷新数据
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="primary"
                onClick={() => handleExport('simple-json')}
                className="flex items-center justify-center gap-2"
                disabled={loading || userData.length === 0}
              >
                <FileText size={16} />
                简化版 JSON
              </Button>
              
              <Button
                variant="accent"
                onClick={() => handleExport('detailed-json')}
                className="flex items-center justify-center gap-2"
                disabled={loading || userData.length === 0}
              >
                <FileText size={16} />
                详细版 JSON
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => handleExport('csv')}
                className="flex items-center justify-center gap-2"
                disabled={loading || userData.length === 0}
              >
                <FileText size={16} />
                CSV 表格
              </Button>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 mb-2">导出说明：</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• <strong>简化版 JSON</strong>：只包含用户名和停留时间，格式简洁</li>
                <li>• <strong>详细版 JSON</strong>：包含完整的用户数据和统计信息</li>
                <li>• <strong>CSV 表格</strong>：可用 Excel 打开的表格格式</li>
                <li>• <strong>数据更新</strong>：前端每30分钟自动上传一次到后台</li>
              </ul>
            </div>
          </div>
        </GlassCard>

        {/* 用户数据预览 */}
        <GlassCard>
          <div className="p-6">
            <h3 className="text-lg font-serif-sc text-sage-600 font-bold flex items-center gap-2 mb-4">
              <Users size={20} />
              用户数据预览（来自后台）
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full mx-auto mb-2"></div>
                <p className="text-gray-500">从后台加载数据中...</p>
              </div>
            ) : userData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无用户数据</p>
                <p className="text-xs text-gray-400 mt-1">用户使用应用后数据会自动收集并上传到后台</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {userData.map((user, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-sage-100"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sage-700">
                        {user.vitaMeId}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.sessionCount} 次会话 • {user.pageViews} 次页面浏览
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-sage-600">
                        {user.stayTimeFormatted}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </GlassCard>
      </main>
    </div>
  );
};

export default DataExport;