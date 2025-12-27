
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { ChevronLeft, Sun, Coffee, BookOpen, Music } from 'lucide-react';
import { motion } from 'framer-motion';

const Daily: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div className="min-h-screen bg-paper p-4 pb-24">
      <header className="flex items-center justify-between mb-8 max-w-2xl mx-auto pt-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/50 rounded-full transition-colors">
          <ChevronLeft className="text-sage-600" />
        </button>
        <div className="text-center">
          <h2 className="text-xl font-serif-sc text-sage-600">每日维他命</h2>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">{today}</p>
        </div>
        <div className="w-10" />
      </header>

      <main className="max-w-2xl mx-auto space-y-6">
        {/* Morning Routine */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-3">
            <Sun className="text-amber-400" size={20} />
            <h3 className="font-serif-sc text-sage-600">晨间能量</h3>
          </div>
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Coffee className="text-amber-500" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-sage-700">饮一杯温润的茉莉花茶</p>
              <p className="text-xs text-gray-400">疏肝理气，唤醒一天的通透感。</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Focus Time */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="text-primary" size={20} />
            <h3 className="font-serif-sc text-sage-600">心流时刻</h3>
          </div>
          <GlassCard className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center">
              <Music className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-sage-700">冥想与自然白噪音</p>
              <p className="text-xs text-gray-400">适合在14:00 - 16:00进行一次深呼吸。</p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Daily Quote */}
        <GlassCard className="bg-primary text-white border-none mt-12 py-10 text-center" delay={0.3}>
          <p className="font-serif-sc text-lg mb-2">“ 顺应天时，自有光芒。 ”</p>
          <p className="text-white/70 text-xs tracking-widest uppercase">The Essence of Vita-Me</p>
        </GlassCard>
        
        <div className="pt-8">
          <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
            重新测算
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Daily;
