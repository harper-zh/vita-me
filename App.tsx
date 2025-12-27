
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import Daily from './pages/Daily';

const App: React.FC = () => {
  return (
    <Router>
      <div className="selection:bg-primary/20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
          <Route path="/daily" element={<Daily />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
