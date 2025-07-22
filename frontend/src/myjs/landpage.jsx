import React from 'react';
import { useNavigate } from 'react-router-dom';
import Galaxy_backend from '../Galaxy/Galaxy_backend';
import BlurText from '../components/BlurText';
import '../styles/landing.css';

function LandingPage() {
  const navigate = useNavigate();
  
  const handleAnimationComplete = () => {
    console.log('LoveSlide animation completed!');
  };

  return (
    <Galaxy_backend variant="landing">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        color: 'white',
        padding: '20px'
      }}>
        {/* BlurText 标题效果 */}
        <BlurText
          text="LoveSlide"
          delay={100}
          animateBy="words"
          direction="top"
          onAnimationComplete={handleAnimationComplete}
          className="landing-title"
          stepDuration={0.15}
          style={{
            fontSize: '4rem',
            fontWeight: '700',
            color: 'white',
            textShadow: '0 4px 16px rgba(255, 255, 255, 0.3)',
            marginBottom: '20px',
            letterSpacing: '-0.02em'
          }}
        />
        
        <p style={{
          fontSize: '1.3rem',
          marginBottom: '50px',
          opacity: '0.85',
          maxWidth: '600px',
          lineHeight: '1.6',
          color: '#e5e5e5',
          animation: 'fadeIn 1.5s ease-in-out 0.8s both'
        }}>
          创建精美的演示文稿，展示您的创意和想法
        </p>
        
        <div style={{
          display: 'flex',
          gap: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          animation: 'fadeIn 1.5s ease-in-out 1.2s both'
        }}>
          <button 
            className="landing-btn landing-btn-primary" 
            onClick={() => navigate('/login')}
          >
            登录
          </button>
          <button 
            className="landing-btn landing-btn-secondary" 
            onClick={() => navigate('/register')}
          >
            注册
          </button>
        </div>
      </div>
    </Galaxy_backend>
  );
}

export default LandingPage; 