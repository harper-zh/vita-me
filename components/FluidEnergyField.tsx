import React, { useState, useMemo } from 'react';
import './FluidEnergyField.css';

interface EnergyData {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

interface FluidEnergyFieldProps {
  data: EnergyData;
}

// 五行元素定义
const elementDefinitions = {
  metal: { 
    label: '金 (锐气)', 
    description: '代表决断力、执行力',
    color: '#C8CCD0'
  },
  wood: { 
    label: '木 (生机)', 
    description: '代表创造力、同情心',
    color: '#a8d39fff'
  },
  water: { 
    label: '水 (智慧)', 
    description: '代表直觉、应变能力',
    color: '#8ed4fcff'
  },
  fire: { 
    label: '火 (感染)', 
    description: '代表热情、社交表现力',
    color: '#f08b7eff'
  },
  earth: { 
    label: '土 (承载)', 
    description: '代表稳定性、财富承载力',
    color: '#e5cfb5ff'
  }
};

export const FluidEnergyField: React.FC<FluidEnergyFieldProps> = ({ data }) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [isContainerHovered, setIsContainerHovered] = useState(false);

  // SVG画布尺寸
  const svgSize = 300;
  const center = svgSize / 2;

  // 计算总数用于比例
  const total = data.wood + data.fire + data.earth + data.metal + data.water;
  
  // 如果没有数据，使用默认值进行演示
  const hasData = total > 0;
  const displayData = hasData ? data : {
    wood: 2,
    fire: 1,
    earth: 2,
    metal: 1,
    water: 2
  };

  // 基础圆圈计算
  const baseCircles = useMemo(() => {
    const elements = [
      { key: 'wood', value: displayData.wood, ...elementDefinitions.wood },
      { key: 'fire', value: displayData.fire, ...elementDefinitions.fire },
      { key: 'earth', value: displayData.earth, ...elementDefinitions.earth },
      { key: 'metal', value: displayData.metal, ...elementDefinitions.metal },
      { key: 'water', value: displayData.water, ...elementDefinitions.water }
    ];

    return elements.map((element, index) => {
      // 正五边形分布：每个圆心间隔72度
      const angleInDegrees = index * 72 - 90; // -90度让第一个圆在顶部
      const angle = angleInDegrees * (Math.PI / 180);
      const distance = 60; // 距离中心的距离
      const x = center + Math.cos(angle) * distance;
      const y = center + Math.sin(angle) * distance;
      
      // 半径映射：12% - 28% 的画布宽度 (显著缩小)
      const displayTotal = displayData.wood + displayData.fire + displayData.earth + displayData.metal + displayData.water;
      const ratio = displayTotal > 0 ? element.value / displayTotal : 0.2;
      const minRadius = svgSize * 0.12; // 12%
      const maxRadius = svgSize * 0.28; // 28% (从35%进一步缩小)
      const radius = minRadius + (maxRadius - minRadius) * ratio;

      return {
        ...element,
        x,
        y,
        radius,
        animationDelay: index * 0.3
      };
    });
  }, [displayData, center, svgSize]);

  // 动态排序圆圈 - 悬停元素渲染在最后(最上层)
  const sortedCircles = useMemo(() => {
    if (!hoveredElement) return baseCircles;
    
    const hoveredIndex = baseCircles.findIndex(circle => circle.key === hoveredElement);
    if (hoveredIndex === -1) return baseCircles;
    
    // 将悬停元素移到数组末尾，确保最后渲染(SVG中最后渲染的在最上层)
    const sorted = [...baseCircles];
    const hoveredCircle = sorted.splice(hoveredIndex, 1)[0];
    sorted.push(hoveredCircle);
    
    return sorted;
  }, [baseCircles, hoveredElement]);

  return (
    <div 
      className={`fluid-energy-container ${isContainerHovered ? 'container-hovered' : ''}`}
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => {
        setIsContainerHovered(false);
        setHoveredElement(null);
      }}
    >
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="fluid-energy-svg"
      >
        {/* 定义滤镜效果 */}
        <defs>
          <filter id="ambientBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.65 0"
            />
          </filter>
          
          <filter id="radialBlur" x="-100%" y="-100%" width="300%" height="300%">
            {/* 径向模糊效果 */}
            <feGaussianBlur stdDeviation="4" result="innerBlur"/>
            <feGaussianBlur stdDeviation="12" result="outerBlur"/>
            <feComposite in="innerBlur" in2="outerBlur" operator="screen" result="combinedBlur"/>
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodOpacity="0.3"/>
            <feMerge> 
              <feMergeNode in="combinedBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>

        {/* 渲染排序后的圆圈 - 单圆设计 */}
        {sortedCircles.map((circle) => {
          const isHovered = hoveredElement === circle.key;
          const isOtherHovered = hoveredElement && hoveredElement !== circle.key;
          
          return (
            <circle
              key={circle.key}
              cx={circle.x}
              cy={circle.y}
              r={circle.radius}
              fill={circle.color}
              opacity={isHovered ? "0.9" : isOtherHovered ? "0.15" : "0.65"}
              filter={isHovered ? "url(#radialBlur)" : "url(#ambientBlur)"}
              className={`energy-circle ${isHovered ? 'circle-active' : ''} ${isOtherHovered ? 'circle-dimmed' : ''}`}
              style={{
                mixBlendMode: isHovered ? 'normal' : 'screen',
                animationDelay: `${circle.animationDelay}s`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                transformOrigin: `${circle.x}px ${circle.y}px`
              }}
              onMouseEnter={() => setHoveredElement(circle.key)}
            />
          );
        })}

        {/* 中心装饰点 */}
        <circle
          cx={center}
          cy={center}
          r="2"
          fill="#A8C4A2"
          opacity={hoveredElement ? "0.2" : "0.5"}
          className="center-dot"
          style={{ transition: 'opacity 0.4s ease-in-out' }}
        />
      </svg>

      {/* 元素标签 - 使用pointer-events: none */}
      <div className="energy-labels">
        {sortedCircles.map((circle) => {
          const isHovered = hoveredElement === circle.key;
          const isOtherHovered = hoveredElement && hoveredElement !== circle.key;
          
          return (
            <div
              key={`label-${circle.key}`}
              className={`energy-label ${isHovered ? 'label-active' : ''} ${isOtherHovered ? 'label-dimmed' : ''}`}
              style={{
                left: `${(circle.x / svgSize) * 100}%`,
                top: `${(circle.y / svgSize) * 100}%`
              }}
            >
              <div className="label-content">
                <span className="label-text">
                  {circle.key === 'wood' && '木'}
                  {circle.key === 'fire' && '火'}
                  {circle.key === 'earth' && '土'}
                  {circle.key === 'metal' && '金'}
                  {circle.key === 'water' && '水'}
                </span>
                <span className="label-value">{circle.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 中心文字 - 使用pointer-events: none */}
      <div className={`center-text ${hoveredElement ? 'text-hidden' : ''}`}>
        <div className="center-title">能量共振</div>
       
      </div>

      {/* 元素详情显示 - 使用pointer-events: none */}
      <div className={`element-details ${hoveredElement ? 'details-visible' : ''}`}>
        {hoveredElement && (
          <div className="detail-content">
            <div 
              className="detail-label"
              style={{ color: elementDefinitions[hoveredElement as keyof typeof elementDefinitions].color }}
            >
              {elementDefinitions[hoveredElement as keyof typeof elementDefinitions].label}
            </div>
            <div className="detail-description">
              {elementDefinitions[hoveredElement as keyof typeof elementDefinitions].description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};