import React from 'react';
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

export const FluidEnergyField: React.FC<FluidEnergyFieldProps> = ({ data }) => {
  // 莫兰迪五行色值 - 调亮版本
  const colors = {
    wood: '#addca2ff',  // 更亮的鼠尾草绿
    fire: '#f2aeb4ff',  // 更亮的桃粉
    earth: '#e5cfb5ff', // 更亮的粘土黄
    metal: '#C8CCD0', // 更亮的迷雾灰
    water: '#5aa2efff'  // 更亮的深海蓝
  };

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

  // 正五边形分布计算圆心位置
  const elements = [
    { key: 'wood', value: displayData.wood, color: colors.wood },
    { key: 'fire', value: displayData.fire, color: colors.fire },
    { key: 'earth', value: displayData.earth, color: colors.earth },
    { key: 'metal', value: displayData.metal, color: colors.metal },
    { key: 'water', value: displayData.water, color: colors.water }
  ];

  const circles = elements.map((element, index) => {
    // 正五边形分布：每个圆心间隔72度
    const angleInDegrees = index * 72 - 90; // -90度让第一个圆在顶部
    const angle = angleInDegrees * (Math.PI / 180);
    const distance = 60; // 距离中心的距离
    const x = center + Math.cos(angle) * distance;
    const y = center + Math.sin(angle) * distance;
    
    // 半径映射：15% - 40% 的画布宽度
    const displayTotal = displayData.wood + displayData.fire + displayData.earth + displayData.metal + displayData.water;
    const ratio = displayTotal > 0 ? element.value / displayTotal : 0.2;
    const minRadius = svgSize * 0.15; // 15%
    const maxRadius = svgSize * 0.4;  // 40%
    const radius = minRadius + (maxRadius - minRadius) * ratio;

    return {
      ...element,
      x,
      y,
      radius,
      animationDelay: index * 0.3
    };
  });

  return (
    <div className="fluid-energy-container">
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
        </defs>

        {/* 绘制五个重叠圆形 */}
        {circles.map((circle, index) => (
          <circle
            key={circle.key}
            cx={circle.x}
            cy={circle.y}
            r={circle.radius}
            fill={circle.color}
            opacity="0.75"
            filter="url(#fluidBlur)"
            className={`energy-circle energy-circle-${index}`}
            style={{
              mixBlendMode: 'screen',
              animationDelay: `${circle.animationDelay}s`,
              transition: 'all 1.5s ease-in-out'
            }}
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
            opacity="0.8"
            filter="url(#softGlow)"
            className={`energy-core energy-core-${index}`}
            style={{
              animationDelay: `${circle.animationDelay + 0.5}s`,
              transition: 'all 1.5s ease-in-out'
            }}
          />
        ))}

        {/* 中心装饰点 */}
        <circle
          cx={center}
          cy={center}
          r="3"
          fill="#A8C4A2"
          opacity="0.6"
          className="center-dot"
        />
      </svg>

      {/* 元素标签 */}
      <div className="energy-labels">
        {circles.map((circle) => (
          <div
            key={`label-${circle.key}`}
            className="energy-label"
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
      <div className="center-text">
        <div className="center-title">能量共振</div>
        <div className="center-subtitle">Energy Resonance</div>
      </div>
    </div>
  );
};