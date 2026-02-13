import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { ChevronDown } from 'lucide-react';

interface ExpandableCardProps {
  id: string;
  title: string;
  summary: string | React.ReactNode;
  content: React.ReactNode;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  className?: string;
  delay?: number;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  id,
  title,
  summary,
  content,
  isExpanded,
  onToggle,
  className = '',
  delay = 0,
  icon,
  badge
}) => {
  return (
    <GlassCard className={`relative overflow-hidden ${className}`} delay={delay}>
      {/* 折叠状态：标题和摘要 */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <h3 className="text-xl font-serif-sc text-primary font-bold flex-1">
              {title}
            </h3>
            {badge && <div className="flex-shrink-0">{badge}</div>}
          </div>
          {/* <div className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {summary}
          </div> */}
        </div>
        <motion.button
          type="button"
          onClick={() => onToggle(id)}
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 ml-2 rounded-full p-1 focus:outline-none hover:bg-gray-100/60 active:bg-gray-200/60"
        >
          <ChevronDown className="text-gray-400" size={20} />
        </motion.button>
      </div>

      {/* 展开状态：完整内容 */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-6 mt-2 border-t border-gray-200/50">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

