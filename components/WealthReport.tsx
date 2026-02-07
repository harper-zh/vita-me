import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { SkeletonCard } from './SkeletonCard';
import { TypewriterText } from './TypewriterText';
import { TrendingUp, Compass, Target, Sparkles, DollarSign, MapPin, Gift, Lightbulb } from 'lucide-react';

interface WealthReportData {
  user_profile?: {
    day_master?: string;
    strength?: string;
    wealth_element?: string;
  };
  modules?: {
    overview?: {
      total_score?: number;
      tier?: string;
      tier_tag?: string;
      native_score?: number;
      yearly_luck_score?: number;
      comment?: string;
    };
    radar?: Array<{
      subject: string;
      score: number;
      analysis: string;
    }>;
    compass?: {
      direction?: string;
      element?: string;
      lucky_item?: string;
      action_sop?: string;
    };
  };
}

interface WealthReportProps {
  data?: WealthReportData;
  delay?: number;
}

// 等级颜色映射
const tierColors: Record<string, { bg: string; text: string; border: string }> = {
  'A7': { bg: 'from-amber-50 to-amber-100/50', text: 'text-amber-700', border: 'border-amber-200' },
  'A6': { bg: 'from-amber-50 to-yellow-100/50', text: 'text-amber-600', border: 'border-amber-200' },
  'A5': { bg: 'from-yellow-50 to-amber-50/50', text: 'text-yellow-700', border: 'border-yellow-200' },
  'B4': { bg: 'from-green-50 to-emerald-50/50', text: 'text-green-700', border: 'border-green-200' },
  'B3': { bg: 'from-blue-50 to-cyan-50/50', text: 'text-blue-700', border: 'border-blue-200' },
  'C2': { bg: 'from-gray-50 to-slate-50/50', text: 'text-gray-700', border: 'border-gray-200' },
  'C1': { bg: 'from-slate-50 to-gray-50/50', text: 'text-slate-700', border: 'border-slate-200' },
};

// 获取等级颜色
const getTierColor = (tier?: string) => {
  if (!tier) return tierColors['B4'];
  return tierColors[tier] || tierColors['B4'];
};

// 雷达图组件
const RadarChart: React.FC<{ data: Array<{ subject: string; score: number }> }> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        暂无数据
      </div>
    );
  }

  const size = 200;
  const center = size / 2;
  const radius = 80;
  const maxScore = 98;
  const minScore = 0;

  // 计算每个维度的角度和坐标
  const angles = data.map((_, i) => (i * 2 * Math.PI) / data.length - Math.PI / 2);
  
  // 将分数归一化到0-1范围（60-98映射到0-1）
  const normalizeScore = (score: number) => {
    return (score - minScore) / (maxScore - minScore);
  };

  // 生成雷达图路径
  const points = data.map((item, i) => {
    const normalizedScore = normalizeScore(item.score);
    const r = radius * normalizedScore;
    const angle = angles[i];
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, label: item.subject, score: item.score };
  });

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景网格圆 */}
        {[0.25, 0.5, 0.75, 1].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={radius * scale}
            fill="none"
            stroke="rgba(107, 144, 128, 0.1)"
            strokeWidth="1"
          />
        ))}
        
        {/* 轴线 */}
        {angles.map((angle, i) => {
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="rgba(107, 144, 128, 0.15)"
              strokeWidth="1"
            />
          );
        })}

        {/* 数据区域 */}
        <path
          d={pathData}
          fill="rgba(230, 184, 162, 0.3)"
          stroke="rgba(230, 184, 162, 0.8)"
          strokeWidth="2"
        />

        {/* 数据点 */}
        {points.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#E6B8A2"
              stroke="#fff"
              strokeWidth="2"
            />
            {/* 标签 - 优化位置避免重叠 */}
            <text
              x={point.x + (point.x - center > 0 ? 12 : -12)}
              y={point.y + (point.y - center > 0 ? 16 : -8)}
              fontSize="10"
              fill="#6B9080"
              textAnchor={point.x > center ? 'start' : 'end'}
              className="font-medium"
            >
              {point.label}
            </text>
            {/* 分数 */}
            <text
              x={point.x}
              y={point.y - 10}
              fontSize="9"
              fill="#6B9080"
              textAnchor="middle"
              className="font-bold"
            >
              {point.score}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const WealthReport: React.FC<WealthReportProps> = ({ data, delay = 0 }) => {
  const overview = data?.modules?.overview;
  const radar = data?.modules?.radar || [];
  const compass = data?.modules?.compass;
  const tierColor = getTierColor(overview?.tier);

  // 如果没有数据，显示骨架屏
  if (!data || !overview) {
    return (
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
          <DollarSign size={16} className="text-amber-500" />
          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">财运报告</span>
        </div>
        <SkeletonCard lines={8} delay={delay} />
      </section>
    );
  }

  return (
    <section className="space-y-6">

      {/* 模块一：财运总览 */}
      <GlassCard 
        className={`relative overflow-hidden group bg-amber-50/50 shadow-lg`}
        delay={delay}
      >
        {/* 背景装饰 - 春节元素 */}
        <div className="absolute -top-8 -right-8 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
          <div className="text-6xl">💰</div>
        </div>
        <div className="absolute top-4 left-4 w-20 h-20 rounded-full border border-amber-200/20 opacity-30">
          <div className="absolute inset-2 rounded-full border border-amber-300/30"></div>
        </div>
        {/* 春节装饰 - 小灯笼 */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-2 right-12 text-xl opacity-20"
        >
          🏮
        </motion.div>

        <div className="space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 text-amber-700 rounded-full text-xs font-semibold">
            <TrendingUp size={14} />
            <span>财运总览</span>
          </div>

          <div className="space-y-4">
            {/* 总分和等级 */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">综合财运指数</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-serif-sc font-bold text-amber-700">
                    {overview.total_score || 0}
                  </span>
                  <span className="text-sm text-gray-400"></span>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 px-3 py-1 bg-white/70 rounded-full border ${tierColor.border}`}>
                  <Sparkles size={12} className={tierColor.text} />
                  <span className={`text-sm font-bold ${tierColor.text}`}>
                    {overview.tier || 'B4'}
                  </span>
                </div>
                {overview.tier_tag && (
                  <p className="text-xs text-gray-500 mt-1">{overview.tier_tag}</p>
                )}
              </div>
            </div>

            {/* 分数分解 */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/60 rounded-lg p-3 border border-white/40">
                <p className="text-xs text-gray-500 mb-1">原局财气</p>
                <p className="text-lg font-bold text-amber-700">{overview.native_score || 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">基准分 10-60</p>
              </div>
              <div className="bg-white/60 rounded-lg p-3 border border-white/40">
                <p className="text-xs text-gray-500 mb-1">2026流年</p>
                <p className="text-lg font-bold text-amber-700">{overview.yearly_luck_score || 0}</p>
                <p className="text-[10px] text-gray-400 mt-1">满分 40</p>
              </div>
            </div>

            {/* 评语 */}
            {overview.comment && (
              <div className="bg-white/50 rounded-lg p-4 border border-amber-100/50">
                <TypewriterText
                  text={overview.comment}
                  speed={30}
                  className="text-sm text-gray-700 leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* 模块二：财富雷达 */}
      {radar.length > 0 && (
        <GlassCard className="bg-gradient-to-br from-white/70 to-sage-50/40 border border-sage-100" delay={delay + 0.1}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-amber-100/50 to-accent/30 rounded-2xl w-fit">
                <Target size={20} className="text-amber-600" />
              </div>
              <div>
                <h4 className="text-lg font-serif-sc text-sage-600 font-bold tracking-wide">
                  财富雷达
                </h4>
                <p className="text-xs text-gray-400 tracking-widest">
                  FIVE-DIMENSIONAL WEALTH MAP
                </p>
              </div>
            </div>

            {/* 雷达图 */}
            <div className="flex justify-center py-4">
              <RadarChart data={radar.map(item => ({ subject: item.subject, score: item.score }))} />
            </div>

            {/* 详细分析 */}
            <div className="space-y-3">
              {radar.map((item, idx) => (
                <div key={idx} className="bg-white/50 rounded-lg p-3 border border-white/40">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-sage-700">{item.subject}</span>
                    <span className="text-sm font-bold text-amber-600">{item.score}分</span>
                  </div>
                  <TypewriterText
                    text={item.analysis}
                    speed={30}
                    className="text-xs text-gray-600 leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      )}

      {/* 模块三：开运罗盘 */}
      {compass && (
        <GlassCard 
          className="relative overflow-hidden group bg-gradient-to-br from-amber-50/60 to-yellow-50/40 border border-amber-200/50 shadow-md"
          delay={delay + 0.2}
        >
          {/* 背景装饰 */}
          <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Compass size={120} className="text-amber-500" />
          </div>
          {/* 春节装饰 - 元宝 */}
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute bottom-4 left-4 text-2xl opacity-15"
          >
            🪙
          </motion.div>

          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 text-amber-700 rounded-full text-xs font-semibold">
              <Compass size={14} />
              <span>开运罗盘</span>
            </div>

            <div className="space-y-4">
              <h4 className="text-xl font-serif-sc text-amber-800 font-bold">2026 开运指南</h4>

              {/* 方位 */}
              {compass.direction && (
                <div className="bg-white/60 rounded-lg p-4 border border-amber-100/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100/50 rounded-lg">
                      <MapPin size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">吉利方位</p>
                      <p className="text-lg font-bold text-amber-700">{compass.direction}</p>
                      {compass.element && (
                        <p className="text-xs text-gray-400 mt-1">五行：{compass.element}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 幸运物品 */}
              {compass.lucky_item && (
                <div className="bg-white/60 rounded-lg p-4 border border-amber-100/50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100/50 rounded-lg">
                      <Gift size={18} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">开运物品</p>
                      <p className="text-sm font-medium text-amber-700">{compass.lucky_item}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 行动建议 */}
              {compass.action_sop && (
                <div className="bg-white/50 rounded-lg p-4 border border-amber-100/50">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100/50 rounded-lg">
                      <Lightbulb size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-2 font-medium">行动建议</p>
                      <TypewriterText
                        text={compass.action_sop}
                        speed={30}
                        className="text-sm text-gray-700 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      )}
    </section>
  );
};

