
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import Daily from './pages/Daily';
import DataExport from './pages/DataExport';
import { DebugPanel } from './components/DebugPanel';
import { SilentMonitoring } from './utils/silentMonitoring';
import './utils/customExport'; // 引入自定义导出工具

const App: React.FC = () => {
  useEffect(() => {
    // 初始化静默监控系统
    const monitoring = SilentMonitoring.getInstance();
    monitoring.init({
      backendEndpoint: 'http://localhost:3001/api/monitoring',
      uploadInterval: 30, // 30分钟自动上传一次
      enableConsoleLog: false // 禁用控制台日志
    });
  }, []);

  return (
    <Router>
      <div className="selection:bg-primary/20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
          <Route path="/daily" element={<Daily />} />
          <Route path="/export" element={<DataExport />} />
        </Routes>
        
        {/* 调试面板 - 仅在开发环境显示 */}
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </div>
    </Router>
  );
};

export default App;
