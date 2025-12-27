import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { calculateBazi, getElementColor } from '../utils/baziUtils';
import { getAIInterpretation, getMoneyAdvice } from '../services/geminiService';
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

  // 五行洞察库
  const insightLibrary = {
    metal: {
      balanced: { // Count 1-2
        title: "核心驱动：锐意革新 (Precision)",
        desc: "金气适中。您拥有极佳的决断力，善于剔除冗余，是团队中执行力最强的破局者。"
      },
      excessive: { // Count 3+
        title: "核心预警：刚极易折 (Rigidity)",
        desc: "金气过旺。您的原则性极强，但需警惕过分挑剔与不妥协。学会柔能克刚是进阶关键。"
      }
    },
    wood: {
      balanced: { // Count 1-2
        title: "核心驱动：栋梁之材 (Growth)",
        desc: "木气疏朗。您具备强大的逻辑与仁爱之心，如大树般向下扎根、向上生长，发展潜力无限。"
      },
      excessive: { // Count 3+
        title: "核心预警：盘根错节 (Overthinking)",
        desc: "木气繁杂。您思维活跃但易陷于细节纠结。需学会修剪枝叶，专注核心目标，避免多谋少断。"
      }
    },
    water: {
      balanced: { // Count 1-2
        title: "核心驱动：运筹帷幄 (Wisdom)",
        desc: "水气通透。您拥有流动的智慧与顶级直觉，善于在变化中寻找机会，适应力极强。"
      },
      excessive: { // Count 3+
        title: "核心预警：随波逐流 (Drifting)",
        desc: "水气漫灌。您思虑深远但易受情绪淹没。需增强定力与边界感，防止聪明反被聪明误。"
      }
    },
    fire: {
      balanced: { // Count 1-2
        title: "核心驱动：燃情领袖 (Charisma)",
        desc: "火气明亮。您是人群中的光源，具有极强的感召力与行动力，能瞬间点燃团队激情。"
      },
      excessive: { // Count 3+
        title: "核心预警：烈火烹油 (Impulsiveness)",
        desc: "火势燎原。您的热情极高但易急躁。需警惕三分钟热度，学会控制节奏，避免透支能量。"
      }
    },
    earth: {
      balanced: { // Count 1-2
        title: "核心驱动：中流砥柱 (Stability)",
        desc: "土气厚重。您信用卓著，稳健可靠。拥有极强的承载力，是值得托付重任的基石。"
      },
      excessive: { // Count 3+
        title: "核心预警：固步自封 (Stubbornness)",
        desc: "土气淤滞。您极其稳重但稍显固执。需警惕墨守成规，适当接纳新知变通，方能打破僵局。"
      }
    }
  };

  // 获取主导元素洞察
  const getDominantInsight = (wuxingData: any) => {
    // 1. 找到数量最多的元素
    const elementCounts = {
      wood: wuxingData.wood || 0,
      fire: wuxingData.fire || 0,
      earth: wuxingData.earth || 0,
      metal: wuxingData.metal || 0,
      water: wuxingData.water || 0
    };

    // 找到最大值的元素
    const maxCount = Math.max(...Object.values(elementCounts));
    const dominantElement = Object.keys(elementCounts).find(
      key => elementCounts[key as keyof typeof elementCounts] === maxCount
    ) as keyof typeof insightLibrary;

    if (!dominantElement || maxCount === 0) {
      return {
        title: "能量平衡 (Balanced)",
        desc: "您的五行能量分布均衡，展现出和谐统一的生命状态。"
      };
    }

    // 2. 判断强度级别
    const intensityLevel = maxCount >= 3 ? 'excessive' : 'balanced';

    // 3. 返回对应的洞察
    return insightLibrary[dominantElement][intensityLevel];
  };

  // 搞钱建议数据
  const [moneyAdvice, setMoneyAdvice] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      if (!date || !time) return;
      
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
        
        // 4. 获取 AI 解读 (传递表单数据)
        const aiResponse = await getAIInterpretation(baziResult, formData);
        setAiData(aiResponse);
        
        // 5. 获取搞钱建议 (传递表单数据)
        const moneyResponse = await getMoneyAdvice(baziResult, formData);
        setMoneyAdvice(moneyResponse);
      } catch (err) {
        console.error("Calculation Error:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
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
              <h3 className="text-2xl font-serif-sc text-sage-600 font-bold">妳的性格底色</h3>
              <p className="text-gray-600 text-sm leading-relaxed tracking-wide ">
                {aiData?.personality}
              </p>
              <div className="pt-2">
                <p className="text-xs text-sage-500 font-medium bg-sage-50 inline-block px-3 py-1 rounded-md">
                  能量平衡状态：{aiData?.elementBalance}
                </p>
              </div>
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
                <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">今日维生素</h4>
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
              {(() => {
                const insight = getDominantInsight(wuxingData);
                return (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-sage-700 tracking-wide">
                      {insight.title}
                    </h4>
                    <p className="text-xs text-sage-600 leading-relaxed">
                      {insight.desc}
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </GlassCard>

        {/* 今日搞钱建议 */}
        <GlassCard className="relative overflow-hidden group bg-gradient-to-br from-green-50 to-emerald-50" delay={0.8}>
          <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={120} className="text-green-500" />
          </div>
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              <DollarSign size={14} />
              <span>{moneyAdvice?.title}</span>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-serif-sc text-sage-600 font-bold">财运密码</h3>
              <p className="text-gray-600 text-sm leading-relaxed tracking-wide">
                {moneyAdvice?.advice}
              </p>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">吉利方位</p>
                  <p className="text-sm font-medium text-sage-600">{moneyAdvice?.luckyDirection}</p>
                </div>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">最佳时机</p>
                  <p className="text-sm font-medium text-sage-600">{moneyAdvice?.luckyTime}</p>
                </div>
              </div>
              
              <div className="bg-green-100/50 rounded-lg p-3">
                <p className="text-xs text-green-600 font-medium mb-1">💡 理财建议</p>
                <p className="text-sm text-green-700">{moneyAdvice?.suggestion}</p>
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
            <GlassCard className="p-4 flex items-center gap-4" delay={0.9}>
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                <Coffee className="text-amber-500" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-sage-700">饮一杯温润的茉莉花茶</p>
                <p className="text-xs text-gray-400">疏肝理气，唤醒一天的通透感</p>
              </div>
            </GlassCard>

            {/* 心流时刻 */}
            <GlassCard className="p-4 flex items-center gap-4" delay={1.0}>
              <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center">
                <Music className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-sage-700">冥想与自然白噪音</p>
                <p className="text-xs text-gray-400">适合在14:00 - 16:00进行一次深呼吸</p>
              </div>
            </GlassCard>
          </div>
        </section>

        {/* 每日金句 */}
        <GlassCard className="bg-primary text-white border-none py-8 text-center" delay={1.1}>
          <p className="font-serif-sc text-lg mb-2">" 顺应天时，自有光芒。 "</p>
          <p className="text-white/70 text-xs tracking-widest uppercase">The Essence of Vita-Me</p>
        </GlassCard>

        <div className="flex flex-col gap-3 pt-4">
          <Button variant="ghost" className="w-full border border-sage-100" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Result;