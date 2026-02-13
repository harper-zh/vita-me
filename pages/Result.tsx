import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { SkeletonCard } from '../components/SkeletonCard';
import { ErrorModal } from '../components/ErrorModal';
import { TypewriterText } from '../components/TypewriterText';
import { calculateBazi, getElementColor } from '../utils/baziUtils';
import { generateBaziInterpretation } from '../services/zhipuService';
import { defaultInterpretation } from '../data/defaultContent';
import { ChevronLeft, Share2, Sparkles, Zap, Fingerprint, Sun, Coffee, Music, DollarSign, X, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { FluidEnergyField } from '../components/FluidEnergyField';
import { WealthReport } from '../components/WealthReport';
import { ExpandableCard } from '../components/ExpandableCard';
import wechatCode from '../wechat_code.jpg';
import html2canvas from 'html2canvas';

// API状态类型
type ApiStatus = 'connecting' | 'generating' | 'success' | 'error';

// 生成进度提示
const generatingSteps = [
  '正在解析性格特质',
  '正在分析财运密码',
  '正在生成养生建议',
  '正在计算五行能量',
  '即将完成...'
];

// 颜色名称到CSS颜色的映射
const colorNameToHex: Record<string, string> = {
  // 橙色系
  '琥珀橙': '#FF8C42',
  '珊瑚橙': '#FF7F50',
  '日落橙': '#FF6B35',
  '暖橙色': '#FF8C69',
  '橙': '#FF8C00',
  '橙色': '#FF8C00',
  
  // 蓝色系
  '薄雾蓝': '#B0C4DE',
  '深海蓝': '#1E3A8A',
  '湖水蓝': '#4A90E2',
  '天蓝色': '#87CEEB',
  '蓝色': '#4A90E2',
  
  // 绿色系
  '鼠尾草绿': '#9CAF88',
  '森林绿': '#228B22',
  '绿色': '#228B22',
  
  // 粉色系
  '桃花粉': '#FFB6C1',
  '粉红色': '#FFB6C1',
  '粉色': '#FFB6C1',
  
  // 紫色系
  '薰衣草紫': '#E6E6FA',
  '紫色': '#9370DB',
  
  // 米色/棕色系
  '暖杏仁米': '#F5DEB3',
  '米色': '#F5DEB3',
  '棕色': '#A0522D',
  
  // 白色系
  '象牙白': '#FFFFF0',
  '白色': '#FFFFFF',
  
  // 其他常见颜色
  '红色': '#DC143C',
  '黄色': '#FFD700',
  '灰色': '#808080',
  '黑色': '#000000',
};

// 从颜色名称中提取主要颜色并转换为hex
const getColorFromName = (colorName: string): string => {
  if (!colorName) return '#6B9080'; // 默认颜色
  
  // 移除可能的英文部分和括号
  const cleanName = colorName.split('(')[0].trim();
  
  // 直接匹配
  if (colorNameToHex[cleanName]) {
    return colorNameToHex[cleanName];
  }
  
  // 模糊匹配 - 查找包含关键词的颜色
  for (const [key, value] of Object.entries(colorNameToHex)) {
    if (cleanName.includes(key) || key.includes(cleanName)) {
      return value;
    }
  }
  
  // 如果都不匹配，尝试从常见颜色关键词提取
  if (cleanName.includes('橙')) return '#FF8C42';
  if (cleanName.includes('蓝')) return '#4A90E2';
  if (cleanName.includes('绿')) return '#9CAF88';
  if (cleanName.includes('粉')) return '#FFB6C1';
  if (cleanName.includes('紫')) return '#E6E6FA';
  if (cleanName.includes('米') || cleanName.includes('杏')) return '#F5DEB3';
  if (cleanName.includes('白')) return '#FFFFF0';
  
  // 默认返回sage绿色
  return '#6B9080';
};

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
  const [apiStatus, setApiStatus] = useState<ApiStatus>('connecting');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // 五行数据用于流体能量场
  const [wuxingData, setWuxingData] = useState<any>({});

  // 分享海报弹层
  const [showPoster, setShowPoster] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  // 保存海报到本地
  const handleSavePoster = async () => {
    if (!posterRef.current) return;
    
    try {
      // 临时移除 scale 变换以获取正确的渲染
      const posterElement = posterRef.current.parentElement as HTMLElement;
      const originalTransform = posterElement?.style.transform || '';
      if (posterElement) {
        posterElement.style.transform = 'scale(1)';
      }

      const canvas = await html2canvas(posterRef.current, {
        backgroundColor: '#FAF9F6',
        scale: 2, // 提高清晰度（2倍分辨率）
        useCORS: true,
        logging: false,
        width: 400,
        height: posterRef.current.scrollHeight
      });
      
      // 恢复原始 transform
      if (posterElement) {
        posterElement.style.transform = originalTransform;
      }
      
      const link = document.createElement('a');
      link.download = `我的马年财运-${vitaminId || 'vita-me'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('保存海报失败:', error);
      alert('保存失败，请稍后重试');
    }
  };

  // 卡片展开状态管理
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // 切换卡片展开状态
  const handleCardToggle = (cardId: string) => {
    setExpandedCardId(prev => prev === cardId ? null : cardId);
  };

  // 财运报告卡片锚点
  const wealthReportRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToWealthRef = useRef(false);

  // 使用 ref 来跟踪是否已经发起请求，防止重复调用（React StrictMode 在开发模式下会执行两次）
  const hasFetchedRef = useRef(false);
  const fetchKeyRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 获取数据的函数
  const fetchData = async (isRetry = false) => {
    if (!date || !time) return;
    
    // 生成唯一的请求key（基于date和time）
    const currentKey = `${date}-${time}`;
    
    // 如果已经为这个key发起过请求且不是重试，跳过
    if (!isRetry && hasFetchedRef.current && fetchKeyRef.current === currentKey) {
      return;
    }
    
    // 标记为已发起请求
    hasFetchedRef.current = true;
    fetchKeyRef.current = currentKey;
    startTimeRef.current = Date.now();
    setApiStatus('connecting');
    setCurrentStep(0);
    
    try {
      // 1. 本地计算八字 (不需要 API) - 立即执行
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
      
      // 4. 3秒后切换到"生成中"状态
      const statusTimer = setTimeout(() => {
        setApiStatus('generating');
        // 开始轮播生成步骤
        stepIntervalRef.current = setInterval(() => {
          setCurrentStep(prev => (prev + 1) % generatingSteps.length);
        }, 2000);
      }, 3000);
      
      // 5. 一次性获取所有 AI 解读
      try {
        console.log('🤖 尝试使用智谱AI生成完整解读...');
        const zhipuResponse = await generateBaziInterpretation(baziResult, formData);
        
        // 清除定时器
        clearTimeout(statusTimer);
        if (stepIntervalRef.current) {
          clearInterval(stepIntervalRef.current);
          stepIntervalRef.current = null;
        }
        
        setAiData({
          ...zhipuResponse,
          source: 'zhipu-ai'
        });
        setApiStatus('success');
        setRetryCount(0);
        console.log('✅ 智谱AI完整解读生成成功');
      } catch (zhipuError) {
        // 清除定时器
        clearTimeout(statusTimer);
        if (stepIntervalRef.current) {
          clearInterval(stepIntervalRef.current);
          stepIntervalRef.current = null;
        }
        
        console.warn('⚠️ 智谱AI调用失败:', zhipuError);
        setApiStatus('error');
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Calculation Error:", err);
      setApiStatus('error');
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    fetchData();
    
    // 清理函数
    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
      const currentKey = `${date}-${time}`;
      if (fetchKeyRef.current !== currentKey) {
        hasFetchedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, time]);

  // 当结果生成成功且包含财运报告模块时，自动锚定到财运报告区域（视口中部）
  useEffect(() => {
    if (
      !hasScrolledToWealthRef.current &&
      apiStatus === 'success' &&
      aiData?.modules &&
      wealthReportRef.current
    ) {
      hasScrolledToWealthRef.current = true;
      setExpandedCardId('wealth-report');
      wealthReportRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [apiStatus, aiData]);

  // 重试函数
  const handleRetry = () => {
    if (retryCount >= 3) {
      handleUseDefault();
      return;
    }
    setRetryCount(prev => prev + 1);
    setShowErrorModal(false);
    fetchData(true);
  };

  // 使用默认内容
  const handleUseDefault = () => {
    setShowErrorModal(false);
    setApiStatus('success');
    setAiData({
      ...defaultInterpretation,
      source: 'default'
    });
  };

  // 返回首页
  const handleGoHome = () => {
    navigate('/');
  };

  // 打开分享海报（需在生成成功且有财运模块时）
  const handleOpenPoster = () => {
    if (apiStatus === 'success' && aiData?.modules) {
      setShowPoster(true);
    }
  };

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

  // 显示加载状态（仅在连接中状态显示全屏加载）
  const showFullLoading = apiStatus === 'connecting';

  // 全屏加载状态（连接中 0-3秒）
  if (showFullLoading) {
    return (
      <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <GlassCard className="py-10 flex flex-col items-center justify-center bg-gradient-to-br from-[#c65b54]/90 to-[#d19b5c]/85 border-none">
            <motion.div
              className="relative w-16 h-16"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            >
              <div className="absolute inset-0 rounded-full border border-amber-200/40" />
              <div className="absolute inset-2 rounded-full border-t-2 border-amber-300" />
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">🪙</span>
              <span className="absolute -right-1 top-6 text-base">🪙</span>
              <span className="absolute -bottom-2 left-1/4 text-sm">🪙</span>
            </motion.div>
            <p className="mt-5 text-xs text-[#fdf5ec]">正在为你盘点 2026 财运...</p>
            <p className="mt-1 text-[11px] text-[#f7e7d5]">金币滚动中 · 请稍候</p>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <ErrorModal
        isOpen={showErrorModal}
        onRetry={handleRetry}
        onUseDefault={handleUseDefault}
        onGoHome={handleGoHome}
        retryCount={retryCount}
        maxRetries={3}
      />

      {/* 生成中状态提示条 */}
      {apiStatus === 'generating' && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-sm shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Sparkles className="text-white" size={20} />
            </motion.div>
            <div className="text-center">
              <p className="text-white font-semibold text-sm">AI正在为您生成个性化解读...</p>
              <p className="text-white/80 text-xs mt-1">{generatingSteps[currentStep]}</p>
            </div>
          </div>
        </div>
      )}

      {/* 分享海报弹层 */}
      {showPoster && aiData?.modules && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="relative" style={{ transform: 'scale(0.7)' }}>
            <div ref={posterRef}>
              <GlassCard className="overflow-hidden bg-gradient-to-br from-[#FAF9F6] via-[#F4E7D8] to-[#E8DFD2] border-[#E6DCCD] shadow-2xl w-[400px]">
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute -top-16 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-10 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 p-4 space-y-3">
                  {/* 标题 & 等级 */}
                  <div className="text-center space-y-1">
                    <p className="text-[10px] tracking-[0.25em] text-[#8C8174] uppercase">
                      我的马年财运
                    </p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-4xl font-serif-sc font-bold text-amber-700 drop-shadow-sm">
                        {aiData.modules.overview?.tier || '—'}
                      </span>
                    </div>
                  </div>

                  {/* 财运总览 & 雷达图：复用 WealthReport（海报精简版） */}
                  <div className="rounded-2xl border border-amber-100/70 bg-white/70 px-3 py-3">
                    <WealthReport data={aiData} delay={0} variant="poster" />
                  </div>

                  {/* 底部二维码 & 文案 */}
                  <div className="pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg bg-white/80 border border-gray-200/70 overflow-hidden flex items-center justify-center">
                        <img
                          src={wechatCode}
                          alt="唯她命小助手微信"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <p className="text-[10px] leading-snug text-[#6B5E51] max-w-[9rem]">
                        扫一扫<br />预见妳的
                        <span className="font-semibold">A8A9富婆之路</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
                        Vita-Me · 2026 丙午
                      </p>
                      
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* 操作按钮 */}
            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSavePoster}
                className="px-4 py-2 rounded-full bg-white shadow-lg flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download size={16} />
                保存到本地
              </button>
              <button
                type="button"
                onClick={() => setShowPoster(false)}
                className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-paper p-4 pb-24 md:p-8 selection:bg-accent/20">
        <header className="flex items-center justify-between mb-8 max-w-2xl mx-auto pt-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-white/50 rounded-full transition-all">
            <ChevronLeft className="text-sage-600" />
          </button>
          <h2 className="text-xl font-serif-sc text-primary font-bold tracking-widest">Vita-Me</h2>
          <button
            className="p-2 hover:bg-white/50 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleOpenPoster}
            disabled={apiStatus !== 'success' || !aiData?.modules}
          >
            <Share2 className="text-primary" size={20} />
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
                <p className="text-lg font-mono font-bold text-primary tracking-wider">{vitaminId}</p>
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
        <ExpandableCard
          id="personality"
          
          title="妳的性格底色"
          summary={aiData?.personality ? aiData.personality.substring(0, 100) + '...' : '正在生成性格分析...'}
          isExpanded={expandedCardId === 'personality'}
          onToggle={handleCardToggle}
          delay={0.4}
          icon={
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
              <Zap size={14} />
              {/* <span>生命能量解读</span> */}
            </div>
          }
          content={
            <div className="space-y-4">
              {aiData?.personality ? (
                <TypewriterText
                  text={aiData.personality}
                  speed={30}
                  className="text-gray-600 text-sm leading-relaxed tracking-wide"
                />
              ) : (
                <SkeletonCard lines={4} />
              )}
            </div>
          }
        />

        {/* 五行流体能量场 */}
        <ExpandableCard
          id="wuxing"
          title="五行能量场"
          summary={aiData?.elementBalance ? aiData.elementBalance.substring(0, 100) + '...' : '正在分析五行能量...'}
          isExpanded={expandedCardId === 'wuxing'}
          onToggle={handleCardToggle}
          delay={0.7}
          className="border-none bg-gradient-to-br from-white/60 to-sage-50/40"
          icon={
            <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl w-fit">
              <Zap size={20} className="text-primary" />
            </div>
          }
          badge={
            <span className="text-xs text-gray-400 tracking-widest">ELEMENTAL ENERGY</span>
          }
          content={
            <div className="space-y-6">
              <FluidEnergyField data={wuxingData} />
              
              {/* 能量解读 */}
              <div className="bg-white/40 rounded-xl p-4 backdrop-blur-sm">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-sage-700 tracking-wide">
                    五行能量状态
                  </h4>
                  {aiData?.elementBalance ? (
                    <TypewriterText
                      text={aiData.elementBalance}
                      speed={30}
                      className="text-xs text-sage-600 leading-relaxed"
                    />
                  ) : (
                    <SkeletonCard lines={2} className="bg-transparent shadow-none border-none p-0" />
                  )}
                </div>
              </div>
            </div>
          }
        />


        {/* 财运报告模块 */}
        {aiData?.modules ? (
          <div ref={wealthReportRef}>
            <ExpandableCard
              id="wealth-report"
              title="2026 财运报告"
              summary={aiData?.modules?.overview?.comment 
                ? aiData.modules.overview.comment.substring(0, 100) + '...'
                : `综合财运指数：${aiData?.modules?.overview?.total_score || 0}分 | ${aiData?.modules?.overview?.tier_tag || '分析中...'}`}
              isExpanded={expandedCardId === 'wealth-report'}
              onToggle={handleCardToggle}
    
              delay={0.85}
              icon={
                <div className="relative">
                  <DollarSign size={16} className="text-amber-500" />
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    className="absolute -top-1 -right-1 text-[10px]"
                  >
                    ✨
                  </motion.div>
                </div>
              }
              badge={
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50/50 rounded-full border border-amber-200/30">
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-sm"
                  >
                    🐴
                  </motion.span>
                  <span className="text-[10px] text-amber-600 font-medium">马年开运</span>
                </div>
              }
              content={
                <WealthReport data={aiData} delay={0} />
              }
            />
          </div>
        ) : (
          <SkeletonCard lines={8} delay={0.85} />
        )}

        {/* 维生素建议卡片 */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiData?.vitamin ? (
            <GlassCard className="bg-white/40" delay={0.5}>
              <div className="space-y-4">
                <div className="p-3 bg-accent/20 rounded-2xl w-fit">
                  <Sparkles size={20} className="text-accent" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">今日唯她命</h4>
                  <p className="text-lg font-serif-sc text-primary font-bold">{aiData.vitamin}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed italic">
                  " {aiData.advice} "
                </p>
              </div>
            </GlassCard>
          ) : (
            <SkeletonCard lines={3} delay={0.5} />
          )}

          {aiData?.luckyColor ? (
            <GlassCard className="bg-white/40" delay={0.6}>
              <div className="space-y-4">
                {(() => {
                  const colorHex = getColorFromName(aiData.luckyColor);
                  return (
                    <>
                      <div className="p-3 rounded-2xl w-fit" style={{ backgroundColor: `${colorHex}20` }}>
                        <div 
                          className="w-5 h-5 rounded-full border" 
                          style={{ 
                            backgroundColor: colorHex,
                            borderColor: `${colorHex}50`
                          }} 
                        />
                      </div>
                      <div>
                        <h4 
                          className="text-xs font-bold uppercase mb-1 text-gray-400"
                          
                        >
                          旺己色
                        </h4>
                        <p className="text-lg font-serif-sc text-sage-600 font-bold" style={{ color: colorHex }}>{aiData.luckyColor}</p>
                      </div>
                    </>
                  );
                })()}
                <p className="text-xs text-gray-500 leading-relaxed">
                  这是妳当下的气场共鸣色，尝试在穿搭或环境中点缀它。
                </p>
              </div>
            </GlassCard>
          ) : (
            <SkeletonCard lines={3} delay={0.6} />
          )}
        </section>

        

        {/* 今日搞钱建议 */}
        {aiData?.wealth ? (
          <ExpandableCard
            id="wealth"
            title="财运密码"
            summary={aiData.wealth.advice ? aiData.wealth.advice.substring(0, 100) + '...' : '正在分析财运...'}
            isExpanded={expandedCardId === 'wealth'}
            onToggle={handleCardToggle}
            delay={0.8}
            className="bg-gradient-to-br from-[#FAF9F6] to-[#E8DFD2] border border-[#E6DCCD] shadow-[0_4px_20px_rgba(180,160,140,0.15)]"
            icon={
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 text-[#6B5E51] rounded-full text-xs font-semibold">
                <DollarSign size={14} />
                {/* <span>{aiData.wealth.title}</span> */}
              </div>
            }
            content={
              <div className="space-y-4">
                <TypewriterText
                  text={aiData.wealth.advice}
                  speed={30}
                  className="text-[#8C8174] text-sm leading-relaxed tracking-wide"
                />
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-white/60 rounded-lg p-3 border border-white/30">
                    <p className="text-xs text-[#8C8174] mb-1 font-medium">吉利方位</p>
                    <p className="text-sm font-medium text-[#6B5E51]">{aiData.wealth.luckyDirection}</p>
                  </div>
                  <div className="bg-white/60 rounded-lg p-3 border border-white/30">
                    <p className="text-xs text-[#8C8174] mb-1 font-medium">最佳时机</p>
                    <p className="text-sm font-medium text-[#6B5E51]">{aiData.wealth.luckyTime}</p>
                  </div>
                </div>
                
                <div className="bg-white/50 rounded-lg p-3 border border-[#E6DCCD]/50">
                  <p className="text-xs text-[#6B5E51] font-medium mb-1">💰 理财建议</p>
                  <p className="text-sm text-[#8C8174]">{aiData.wealth.suggestion}</p>
                </div>
              </div>
            }
          />
        ) : (
          <SkeletonCard lines={5} delay={0.8} className="bg-gradient-to-br from-[#FAF9F6] to-[#E8DFD2]" />
        )}



        {/* 今日养生建议 */}
        <ExpandableCard
          id="health"
          title="每日养生建议"
          summary={aiData?.health?.morning?.action && aiData?.health?.flow?.action 
            ? `${aiData.health.morning.action} | ${aiData.health.flow.action}`
            : '正在生成养生建议...'}
          isExpanded={expandedCardId === 'health'}
          onToggle={handleCardToggle}
          delay={0.9}
          icon={
            <div className="flex items-center gap-2">
              <Sun size={16} className="text-amber-400" />
            </div>
          }
          content={
            <div className="space-y-4">
              {/* 晨间能量 */}
              {aiData?.health?.morning ? (
                <div className="p-4 flex items-center gap-4 bg-amber-50/30 rounded-xl">
                  <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Coffee className="text-amber-500" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-sage-700 mb-2">{aiData.health.morning.action}</p>
                    <TypewriterText
                      text={aiData.health.morning.benefit}
                      speed={30}
                      className="text-xs text-gray-400"
                    />
                  </div>
                </div>
              ) : (
                <SkeletonCard lines={2} className="bg-transparent shadow-none border-none p-0" />
              )}

              {/* 心流时刻 */}
              {aiData?.health?.flow ? (
                <div className="p-4 flex items-center gap-4 bg-sage-50/30 rounded-xl">
                  <div className="w-12 h-12 bg-sage-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Music className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-sage-700 mb-2">{aiData.health.flow.action}</p>
                    <TypewriterText
                      text={aiData.health.flow.benefit}
                      speed={30}
                      className="text-xs text-gray-400"
                    />
                  </div>
                </div>
              ) : (
                <SkeletonCard lines={2} className="bg-transparent shadow-none border-none p-0" />
              )}
            </div>
          }
        />



        <div className="flex flex-col gap-3 pt-4">
          <Button variant="ghost" className="w-full border border-sage-100 text-primary" onClick={() => navigate('/')}>
            返回首页
          </Button>
        </div>

        {/* 每日金句 */}
        <p className="font-serif-sc text-sm mb-2 text-primary text-center">" 顺应天时，自有光芒 " <br />The Essence of Vita-Me</p>
      </main>
    </div>
    </>
  );
};

export default Result;