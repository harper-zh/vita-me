import React, { useState } from 'react';
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
    color: '#f0e9e9ff'
  },
  wood: { 
    label: '木 (生机)', 
    description: '代表创造力、同情心',
    color: '#addca2ff'
  },
  water: { 
    label: '水 (智慧)', 
    description: '代表直觉、应变能力',
    color: '#5aa2efff'
  },
  fire: { 
    label: '火 (感染)', 
    description: '代表热情、社交表现力',
    color: '#f2aeb4ff'
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
  const svgSize = 500;
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

  // 正五边形分布计算圆心位置
  const elements = [
    { key: 'wood', value: displayData.wood, ...elementDefinitions.wood },
    { key: 'fire', value: displayData.fire, ...elementDefinitions.fire },
    { key: 'earth', value: displayData.earth, ...elementDefinitions.earth },
    { key: 'metal', value: displayData.metal, ...elementDefinitions.metal },
    { key: 'water', value: displayData.water, ...elementDefinitions.water }
  ];

  const circles = elements.map((element, index) => {
    // 正五边形分布：每个圆心间隔72度
    const angleInDegrees = index * 72 - 90; // -90度让第一个圆在顶部
    const angle = angleInDegrees * (Math.PI / 180);
    const distance = 60; // 距离中心的距离
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance;
    
    // 半径映射：15% - 35% 的画布宽度 (缩小最大半径)
    const displayTotal = displayData.wood + displayData.fire + displayData.earth + displayData.metal + displayData.water;
    const ratio = displayTotal > 0 ? element.value / displayTotal : 0.1;
    const minRadius = svgSize * 0.15; // 15%
    const maxRadius = svgSize * 0.45; 
    const radius = minRadius + (maxRadius - minRadius) * ratio;

    // 计算交互状态
    const isHovered = hoveredElement === element.key;
    const isOtherHovered = hoveredElement && hoveredElement !== element.key;

    return {
      ...element,
      x,
      y,
      radius,
      animationDelay: index * 0.3,
      isHovered,
      isOtherHovered
    };
  });

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
        {/* 定义流体特效滤镜 */}
        <defs>
          <filter id="fluidBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.7 0"
            />
          </filter>
          
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>

          <filter id="intenseGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="20" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/> 
            </feMerge>
          </filter>
        </defs>

        {/* 绘制五个重叠圆形 */}
        {circles.map((circle, index) => (
          <circle
            key={circle.key}
            cx={circle.x}
            cy={circle.y}
            r={circle.radius}
            fill={circle.color}
            opacity={circle.isHovered ? "0.95" : circle.isOtherHovered ? "0.3" : "0.75"}
            filter={circle.isHovered ? "url(#intenseGlow)" : "url(#fluidBlur)"}
            className={`energy-circle energy-circle-${index} ${circle.isHovered ? 'circle-spotlight' : ''} ${circle.isOtherHovered ? 'circle-dimmed' : ''}`}
            style={{
              mixBlendMode: 'screen',
              animationDelay: `${circle.animationDelay}s`,
              transition: 'all 0.4s ease-in-out',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredElement(circle.key)}
          />
        ))}

        {/* 添加柔和的内核 */}
        {circles.map((circle, index) => (
          <circle
            key={`core-${circle.key}`}
            cx={circle.x}
            cy={circle.y}
            r={circle.radius * 0.3}
            fill={circle.color}
            opacity={circle.isHovered ? "1" : circle.isOtherHovered ? "0.4" : "0.8"}
            filter={circle.isHovered ? "url(#intenseGlow)" : "url(#softGlow)"}
            className={`energy-core energy-core-${index} ${circle.isHovered ? 'core-spotlight' : ''}`}
            style={{
              animationDelay: `${circle.animationDelay + 0.5}s`,
              transition: 'all 0.4s ease-in-out',
              cursor: 'pointer'
            }}
            onMouseEnter={() => setHoveredElement(circle.key)}
          />
        ))}

        {/* 中心装饰点 */}
        <circle
          cx={center}
          cy={center}
          r="3"
          fill="#A8C4A2"
          opacity={hoveredElement ? "0.3" : "0.6"}
          className="center-dot"
          style={{ transition: 'opacity 0.4s ease-in-out' }}
        />
      </svg>

      {/* 元素标签 */}
      <div className="energy-labels">
        {circles.map((circle) => (
          <div
            key={`label-${circle.key}`}
            className={`energy-label ${circle.isHovered ? 'label-spotlight' : ''} ${circle.isOtherHovered ? 'label-dimmed' : ''}`}
            style={{
              left: `${(circle.x / svgSize) * 100}%`,
              top: `${(circle.y / svgSize) * 100}%`
            }}
          >
            <div className="label-content">
              <div 
                className="label-dot"
                style={{ backgroundColor: circle.color }}
              />
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
        ))}
      </div>

      {/* 中心文字 */}
      <div className={`center-text ${hoveredElement ? 'text-hidden' : ''}`}>
        <div className="center-title">能量共振</div>
        
      </div>

      {/* 元素详情显示 */}
      <div className={`element-details ${hoveredElement ? 'details-visible' : ''}`}>
        {hoveredElement && (
          <div className="detail-content" style={{ color: elementDefinitions[hoveredElement as keyof typeof elementDefinitions].color }}>
            <div className="detail-label">
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