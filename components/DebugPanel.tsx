import React, { useState, useEffect } from 'react';

interface DebugInfo {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DebugInfo[]>([]);

  useEffect(() => {
    // 拦截console.log, console.warn, console.error
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const addLog = (type: DebugInfo['type'], message: string) => {
      setLogs(prev => [...prev.slice(-19), {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message
      }]);
    };

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('🔮') || message.includes('💰') || message.includes('📡') || message.includes('✅') || message.includes('⚠️') || message.includes('🎲')) {
        addLog('info', message);
      }
      originalLog(...args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      addLog('warning', message);
      originalWarn(...args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      addLog('error', message);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  const clearLogs = () => setLogs([]);

  const getLogColor = (type: DebugInfo['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <>
      {/* 调试按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="调试面板"
      >
        🔧
      </button>

      {/* 调试面板 */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-96 max-h-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">API调用日志</h3>
            <div className="flex gap-2">
              <button
                onClick={clearLogs}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
              >
                清空
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                暂无日志
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-2 text-xs">
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 shrink-0">
                      {log.timestamp}
                    </span>
                    <span className={`${getLogColor(log.type)} break-all`}>
                      {log.message}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>API Key状态:</span>
              <span className={process.env.ZHIPU_API_KEY ? 'text-green-600' : 'text-red-600'}>
                {process.env.ZHIPU_API_KEY ? '已配置' : '未配置'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};