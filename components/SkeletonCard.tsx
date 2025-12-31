import React from 'react';
import { GlassCard } from './GlassCard';

interface SkeletonCardProps {
  lines?: number;
  className?: string;
  delay?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  lines = 3, 
  className = '',
  delay = 0 
}) => {
  return (
    <GlassCard className={className} delay={delay}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-shimmer"
            style={{
              width: idx === lines - 1 ? '60%' : '100%',
              animationDelay: `${idx * 0.1}s`
            }}
          />
        ))}
      </div>
    </GlassCard>
  );
};

// 添加shimmer动画到全局样式
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
  .animate-shimmer {
    background-size: 2000px 100%;
    animation: shimmer 1.5s infinite linear;
  }
`;
if (!document.head.querySelector('style[data-skeleton]')) {
  style.setAttribute('data-skeleton', 'true');
  document.head.appendChild(style);
}

