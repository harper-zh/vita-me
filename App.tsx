
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import Daily from './pages/Daily';
import { DebugPanel } from './components/DebugPanel';

const App: React.FC = () => {
  return (
    <Router>
      <div className="selection:bg-primary/20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
          <Route path="/daily" element={<Daily />} />
        </Routes>
        
        {/* 调试面板 - 仅在开发环境显示 */}
        {process.env.NODE_ENV === 'development' && <DebugPanel />}
      </div>
    </Router>
  );
};

export default App;
