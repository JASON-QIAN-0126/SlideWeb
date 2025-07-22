import React, { useState } from 'react';
import Galaxy from './Galaxy';

export default function GalaxyTest() {
  const [config, setConfig] = useState({
    mouseInteraction: true,
    mouseRepulsion: true,
    density: 1,
    glowIntensity: 0.3,
    saturation: 0,
    hueShift: 0,
    twinkleIntensity: 0.3,
    rotationSpeed: 0.1,
    repulsionStrength: 2,
    autoCenterRepulsion: 0,
    starSpeed: 0.5,
    speed: 1,
    transparent: false
  });

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 控制面板 */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 1000,
        fontSize: '12px',
        maxWidth: '300px',
        pointerEvents: 'auto' // 确保控制面板可以交互
      }}>
        <h3>Galaxy Controls</h3>
        
        <label>
          <input
            type="checkbox"
            checked={config.mouseInteraction}
            onChange={(e) => setConfig({...config, mouseInteraction: e.target.checked})}
          />
          Mouse Interaction
        </label>
        
        <br />
        
        <label>
          <input
            type="checkbox"
            checked={config.mouseRepulsion}
            onChange={(e) => setConfig({...config, mouseRepulsion: e.target.checked})}
          />
          Mouse Repulsion
        </label>
        
        <br />
        
        <label>
          Density: {config.density}
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={config.density}
            onChange={(e) => setConfig({...config, density: parseFloat(e.target.value)})}
          />
        </label>
        
        <br />
        
        <label>
          Glow Intensity: {config.glowIntensity}
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.glowIntensity}
            onChange={(e) => setConfig({...config, glowIntensity: parseFloat(e.target.value)})}
          />
        </label>
        
        <br />
        
        <label>
          Repulsion Strength: {config.repulsionStrength}
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={config.repulsionStrength}
            onChange={(e) => setConfig({...config, repulsionStrength: parseFloat(e.target.value)})}
          />
        </label>
        
        <br />
        
        <div style={{ marginTop: '10px', color: '#ccc' }}>
          <small>
            Move your mouse over the galaxy to see repulsion effects.
            {config.mouseInteraction ? ' ✅ Mouse interaction enabled' : ' ❌ Mouse interaction disabled'}
          </small>
        </div>
      </div>
      
      {/* Galaxy 背景 */}
      <Galaxy {...config} />
    </div>
  );
} 