import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { DataSourceIndicator } from '../components/DataSourceIndicator';
import { calculateBazi, getElementColor } from '../utils/baziUtils';
import { generateBaziInterpretation } from '../services/zhipuService';
import { defaultInterpretation, defaultWuxingInsight } from '../data/defaultContent';
import { ChevronLeft, Share2, Sparkles, Wind, Zap, Fingerprint, Sun, Coffee, Music, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { FluidEnergyField } from '../components/FluidEnergyField';

const Result: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const vitaminId = searchParams.get('vitaminId') || '';
  const province = searchParams.get('province') || '';
  const city = searchParams.get('city') || '';
  
  const [bazi, setBazi] = useState<any>(null);
  const [aiData, setAiData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 五行数据用于流体能量场
  const [wuxingData, setWuxingData] = useState<any>({});

  // 使用 ref 来跟踪是否已经发起请求，防止重复调用（React StrictMode 在开发模式下会执行两次）
  const hasFetchedRef = useRef(false);
  const fetchKeyRef = useRef<string>('');

  useEffect(() => {
    async function fetchData() {
      if (!date || !time) return;
      
      // 生成唯一的请求key（基于date和time）
      const currentKey = `${date}-${time}`;
      
      // 如果已经为这个key发起过请求，跳过
      if (hasFetchedRef.current && fetchKeyRef.current === currentKey) {
        return;
      }
      
      // 标记为已发起请求
      hasFetchedRef.current = true;
      fetchKeyRef.current = currentKey;
      
      try {
        // 1. 本地计算八字 (不需要 API)
        const baziResult = calculateBazi(date, time);
        setBazi(baziResult);
        
        // 2. 处理五行数据
        const wuxingCount = processWuxingData(baziResult.wuxing);
        setWuxingData(wuxingCount);
        
        // 3. 准备表单数据
        const formData = {
          year: parseInt(date.split('-')[0]),
          month: parseInt(date.split('-')[1]),
          day: parseInt(date.split('-')[2]),
          hour: parseInt(time.split(':')[0])
        };
        
        // 4. 一次性获取所有 AI 解读 (优先使用智谱AI，失败时使用默认话术)
        try {
          console.log('🤖 尝试使用智谱AI生成完整解读...');
          const zhipuResponse = await generateBaziInterpretation(baziResult, formData);
          setAiData({
            ...zhipuResponse,
            source: 'zhipu-ai'
          });
          console.log('✅ 智谱AI完整解读生成成功');
        } catch (zhipuError) {
          console.warn('⚠️ 智谱AI调用失败，使用默认话术:', zhipuError);
          // 使用默认话术
          setAiData({
            ...defaultInterpretation,
            source: 'default'
          });
        }
      } catch (err) {
        console.error("Calculation Error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    
    // 清理函数：当date或time变化时，重置标志以允许新的请求
    return () => {
      // 如果key变化了，重置标志（允许新的请求）
      const currentKey = `${date}-${time}`;
      if (fetchKeyRef.current !== currentKey) {
        hasFetchedRef.current = false;
      }
    };
  }, [date, time]);

  // 处理五行数据用于流体能量场
  const processWuxingData = (wuxing: string[]) => {
    const elementCount: { [key: string]: number } = {
      '木': 0,
      '火': 0,
      '土': 0,
      '金': 0,
      '水': 0
    };

    // 统计五行出现次数 - 每个wuxing项可能包含两个字符
    wuxing.forEach(wuxingPair => {
      // 将每个字符分别统计
      for (let i = 0; i < wuxingPair.length; i++) {
        const element = wuxingPair[i];
        if (elementCount.hasOwnProperty(element)) {
          elementCount[element]++;
        }
      }
    });

    // 转换为流体能量场需要的格式
    return {
      wood: elementCount['木'],
      fire: elementCount['火'],
      earth: elementCount['土'],
      metal: elementCount['金'],
      water: elementCount['水']
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center space-y-6">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <div className="w-16 h-16 border-2 border-primary/20 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-primary rounded-full" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={20} />
        </motion.div>
        <div className="text-center space-y-2">
          <p className="text-sage-600 font-serif-sc text-xl tracking-widest">正在采撷妳的星尘</p>
          <p className="text-gray-400 text-xs animate-pulse">解析生命密码中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper p-4 pb-24 md:p-8 selection:bg-accent/20">
      <header className="flex items-center justify-between mb-8 max-w-2xl mx-auto pt-4">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-white/50 rounded-full transition-all">
          <ChevronLeft className="text-sage-600" />
        </button>
        <h2 className="text-xl font-serif-sc text-sage-600 font-bold tracking-widest">Vita-Me</h2>
        <button className="p-2 hover:bg-white/50 rounded-full transition-all">
          <Share2 className="text-sage-600" size={20} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto space-y-8">
        {/* Vitamin ID 显示 */}
        {vitaminId && (
          <GlassCard className="bg-gradient-to-r from-primary/10 to-accent/10 border-none" delay={0.1}>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/60 rounded-2xl">
                <Fingerprint size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                {/* <p className="text-xs font-bold text-gray-400 uppercase mb-1">Vitamin ID</p> */}
                <p className="text-lg font-mono font-bold text-sage-600 tracking-wider">{vitaminId}</p>
                {(province || city) && (
                  <p className="text-xs text-gray-500 mt-1">
                    出生地：{province} {city}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* 八字原局 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Fingerprint size={16} className="text-primary" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">八字解读</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {bazi && [
              { label: '年柱', val: bazi.year },
              { label: '月柱', val: bazi.month },
              { label: '日柱', val: bazi.day },
              { label: '时柱', val: bazi.hour }
            ].map((item, idx) => (
              <GlassCard key={idx} className="p-4 text-center border-none" delay={idx * 0.1}>
                <p className="text-[10px] text-gray-400 mb-3 font-medium uppercase">{item.label}</p>
                <div className="text-2xl font-serif-sc font-bold text-sage-600 flex flex-col gap-1">
                  {item.val && item.val.split('').map((char: string, i: number) => (
                    <span key={i} className={getElementColor(char)}>{char}</span>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* AI 性格解读 */}
        <GlassCard className="relative overflow-hidden group" delay={0.4}>
          <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wind size={120} className="text-primary" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              <Zap size={14} />
              <span>AI 生命能量解读</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-2xl font-serif-sc text-sage-600 font-bold">妳的性格底色</h3>
                
              </div>
              <p className="text-gray-600 text-sm leading-relaxed tracking-wide ">
                {aiData?.personality}
              </p>
              
            </div>
          </div>
        </GlassCard>

        {/* 维生素建议卡片 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="bg-white/40" delay={0.5}>
            <div className="space-y-4">
              <div className="p-3 bg-accent/20 rounded-2xl w-fit">
                <Sparkles size={20} className="text-accent" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">今日唯她命</h4>
                <p className="text-lg font-serif-sc text-sage-600 font-bold">{aiData?.vitamin}</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed italic">
                " {aiData?.advice} "
              </p>
            </div>
          </GlassCard>

          <GlassCard className="bg-white/40" delay={0.6}>
            <div className="space-y-4">
              <div className="p-3 bg-primary/20 rounded-2xl w-fit">
                <div className="w-5 h-5 rounded-full border border-primary/30" style={{ backgroundColor: '#6B9080' }} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">旺己色</h4>
                <p className="text-lg font-serif-sc text-sage-600 font-bold">{aiData?.luckyColor}</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                这是妳当下的气场共鸣色，尝试在穿搭或环境中点缀它。
              </p>
            </div>
          </GlassCard>
        </section>

        {/* 五行流体能量场 */}
        <GlassCard className="relative overflow-hidden border-none bg-gradient-to-br from-white/60 to-sage-50/40" delay={0.7}>
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl w-fit">
                <Zap size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="text-lg font-serif-sc text-sage-600 font-bold tracking-wide">
                  五行能量场
                </h4>
                <p className="text-xs text-gray-400 tracking-widest">
                  ELEMENTAL ENERGY RESONANCE
                </p>
              </div>
            </div>
            
            <FluidEnergyField data={wuxingData} />
            
            {/* 能量解读 */}
            <div className="bg-white/40 rounded-xl p-4 backdrop-blur-sm">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-sage-700 tracking-wide">
                  五行能量状态
                </h4>
                
                <p className="text-xs text-sage-600 leading-relaxed">
                  {aiData?.elementBalance || defaultWuxingInsight.desc}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 今日搞钱建议 */}
        <GlassCard className="relative overflow-hidden group bg-gradient-to-br from-[#FAF9F6] to-[#E8DFD2] border border-[#E6DCCD] shadow-[0_4px_20px_rgba(180,160,140,0.15)]" delay={0.8}>
          <div className="absolute -top-6 -right-6 p-4 opacity-8 group-hover:opacity-12 transition-opacity">
            <TrendingUp size={120} className="text-[#B5A695]" />
          </div>
          
          {/* 微妙的装饰元素 */}
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border border-[#C6B299] opacity-4">
            <div className="absolute inset-2 rounded-full border border-[#B5A695] opacity-60"></div>
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 text-[#6B5E51] rounded-full text-xs font-semibold">
              <DollarSign size={14} />
              <span>{aiData?.wealth?.title}</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-serif-sc text-[#6B5E51] font-bold">财运密码</h3>
                
              </div>
              <p className="text-[#8C8174] text-sm leading-relaxed tracking-wide">
                {aiData?.wealth?.advice}
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/60 rounded-lg p-3 border border-white/30">
                  <p className="text-xs text-[#8C8174] mb-1 font-medium">吉利方位</p>
                  <p className="text-sm font-medium text-[#6B5E51]">{aiData?.wealth?.luckyDirection}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3 border border-white/30">
                  <p className="text-xs text-[#8C8174] mb-1 font-medium">最佳时机</p>
                  <p className="text-sm font-medium text-[#6B5E51]">{aiData?.wealth?.luckyTime}</p>
                </div>
              </div>
              
              <div className="bg-white/50 rounded-lg p-3 border border-[#E6DCCD]/50">
                <p className="text-xs text-[#6B5E51] font-medium mb-1">💰 理财建议</p>
                <p className="text-sm text-[#8C8174]">{aiData?.wealth?.suggestion}</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* 今日养生建议 */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sun size={16} className="text-amber-400" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">每日养生建议</span>
          </div>
          
          <div className="space-y-4">
            {/* 晨间能量 */}
            {aiData?.health?.morning && (
              <GlassCard className="p-4 flex items-center gap-4" delay={0.9}>
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                  <Coffee className="text-amber-500" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-sage-700">{aiData.health.morning.action}</p>
                  <p className="text-xs text-gray-400">{aiData.health.morning.benefit}</p>
                </div>
              </GlassCard>
            )}

            {/* 心流时刻 */}
            {aiData?.health?.flow && (
              <GlassCard className="p-4 flex items-center gap-4" delay={1.0}>
                <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center">
                  <Music className="text-primary" size={24} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-sage-700">{aiData.health.flow.action}</p>
                  <p className="text-xs text-gray-400">{aiData.health.flow.benefit}</p>
                </div>
              </GlassCard>
            )}
          </div>
        </section>



        <div className="flex flex-col gap-3 pt-4">
          <Button variant="ghost" className="w-full border border-sage-100" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>

        {/* 每日金句 */}
        <p className="font-serif-sc text-sm mb-2 text-primary text-center">" 顺应天时，自有光芒 " <br />The Essence of Vita-Me</p>
      </main>
    </div>
  );
};

export default Result;