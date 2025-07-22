import React from 'react';
import Galaxy from './Galaxy';

export default function Galaxy_backend({ 
  children, 
  variant = 'auth', // 'auth', 'landing', 'dashboard'
  className = '',
  ...props 
}) {
  // 根据不同页面类型设置不同的Galaxy参数 - 黑白灰色调
  const getGalaxyConfig = () => {
    switch (variant) {
      case 'landing':
        return {
          mouseRepulsion: true,
          mouseInteraction: true,
          density: 1,
          glowIntensity: 0.7,
          saturation: 0.0, // 黑白灰，无饱和度
          hueShift: 140, // 无色调偏移
          speed: 0.5,
          twinkleIntensity: 0.3,
          rotationSpeed: 0.1,
          repulsionStrength: 2,
          transparent: false
        };
      case 'auth':
        return {
          mouseRepulsion: true,
          mouseInteraction: true,
          density: 1,
          glowIntensity: 0.7,
          saturation: 0.0, // 黑白灰，无饱和度
          hueShift: 140, // 无色调偏移
          speed: 0.5,
          twinkleIntensity: 0.3,
          rotationSpeed: 0.1,
          repulsionStrength: 2,
          transparent: false
        };
      case 'dashboard':
        return {
          mouseRepulsion: false,
          mouseInteraction: true,
          density: 1,
          glowIntensity: 0.7,
          saturation: 0.0, // 黑白灰，无饱和度
          hueShift: 140, // 无色调偏移
          speed: 0.5,
          twinkleIntensity: 0.3,
          rotationSpeed: 0.1,
          repulsionStrength: 2,
          transparent: false
        };
      default:
        return {
          mouseRepulsion: true,
          mouseInteraction: true,
          density: 1,
          glowIntensity: 0.7,
          saturation: 0.0, // 黑白灰，无饱和度
          hueShift: 140, // 无色调偏移
          speed: 0.5,
          twinkleIntensity: 0.3,
          rotationSpeed: 0.1,
          repulsionStrength: 2,
          transparent: false
        };
    }
  };

  const galaxyConfig = getGalaxyConfig();

  return (
    <div className={`galaxy-background ${className}`} style={{ 
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '100vh',
      overflow: 'hidden'
    }}>
      {/* Galaxy背景层 - 最高层级，接受鼠标事件 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10
      }}>
        <Galaxy {...galaxyConfig} {...props} />
      </div>
      
      {/* 内容层 - 透明鼠标事件，只有特定元素可交互 */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        pointerEvents: 'none' // 让鼠标事件穿透到Galaxy层
      }}>
        {children}
      </div>
    </div>
  );
} 