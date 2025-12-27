
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Sparkles, Heart, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

const Home: React.FC = () => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('12:00');
  const navigate = useNavigate();

  const handleStart = () => {
    if (!date) return;
    navigate(`/result?date=${date}&time=${time}`);
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block p-4 bg-white/80 rounded-full shadow-sm mb-4"
          >
            <Sparkles className="text-primary w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl font-serif-sc font-bold text-sage-600 tracking-wider mb-2">唯她命</h1>
          <p className="text-gray-500 font-light tracking-widest uppercase text-sm">Vita-Me Lifestyle</p>
        </div>

        <GlassCard className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-sage-600 block">开启你的生命底色</label>
            <p className="text-xs text-gray-400">输入你的出生时间，获取专属的“生活维生素”</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 ml-1">出生日期</span>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/50 border border-sage-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-gray-400 ml-1">出生时辰</span>
              <input 
                type="time" 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-white/50 border border-sage-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <Button 
            className="w-full" 
            onClick={handleStart}
            disabled={!date}
          >
            开启解读
          </Button>

          <div className="flex justify-center gap-6 pt-4 text-gray-400">
            <div className="flex items-center gap-1 text-[10px]">
              <Heart size={14} className="text-accent" />
              <span>精准测算</span>
            </div>
            <div className="flex items-center gap-1 text-[10px]">
              <Moon size={14} className="text-indigo-300" />
              <span>AI赋能</span>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Home;
