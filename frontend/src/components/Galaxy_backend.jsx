import React from 'react';
import Galaxy from './Galaxy';

export default function Galaxy_backend({ 
  children, 
  variant = 'auth', // 'auth', 'landing', 'dashboard'
  className = '',
  ...props 
}) {
  // 根据不同页面类型设置不同的Galaxy参数
  const getGalaxyConfig = () => {
    switch (variant) {
      case 'landing':
        return {
          mouseRepulsion: true,
          mouseInteraction: true,
          density: 1.2,
          glowIntensity: 0.4,
          saturation: 0.6,
          hueShift: 200,
          speed: 0.8,
          twinkleIntensity: 0.4,
          rotationSpeed: 0.05,
          repulsionStrength: 3,
          transparent: false
        };
      case 'auth':
        return {
          mouseRepulsion: true,
          mouseInteraction: true,
          density: 1.0,
          glowIntensity: 0.3,
          saturation: 0.4,
          hueShift: 240,
          speed: 0.6,
          twinkleIntensity: 0.3,
          rotationSpeed: 0.03,
          repulsionStrength: 2,
          transparent: false
        };
      case 'dashboard':
        return {
          mouseRepulsion: false,
          mouseInteraction: true,
          density: 0.8,
          glowIntensity: 0.2,
          saturation: 0.3,
          hueShift: 180,
          speed: 0.4,
          twinkleIntensity: 0.2,
          rotationSpeed: 0.02,
          autoCenterRepulsion: 1,
          transparent: false
        };
      default:
        return {
          mouseRepulsion: true,
          mouseInteraction: true,
          density: 1.0,
          glowIntensity: 0.3,
          saturation: 0.4,
          hueShift: 240,
          speed: 0.6,
          twinkleIntensity: 0.3,
          rotationSpeed: 0.03,
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
      {/* Galaxy背景层 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        <Galaxy {...galaxyConfig} {...props} />
      </div>
      
      {/* 内容层 */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        height: '100%',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  );
} 