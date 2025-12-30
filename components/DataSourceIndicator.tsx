import React from 'react';

interface DataSourceIndicatorProps {
  source?: 'ai' | 'random';
  className?: string;
}

export const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({ 
  source = 'random', 
  className = '' 
}) => {
  if (source === 'ai') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>智谱AI生成</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium ${className}`}>
      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
      <span>随机数据库</span>
    </div>
  );
};