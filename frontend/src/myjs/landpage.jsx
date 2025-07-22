import React from 'react';
import { useNavigate } from 'react-router-dom';
import Galaxy_backend from '../components/Galaxy_backend';

function LandingPage() {
  const navigate = useNavigate();
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
        <h1 style={{
          fontSize: '3.5rem',
          marginBottom: '20px',
          fontWeight: '700',
          textShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 1s ease-in-out'
        }}>
          欢迎使用 Presto
        </h1>
        <p style={{
          fontSize: '1.3rem',
          marginBottom: '40px',
          opacity: '0.9',
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          创建精美的演示文稿，展示您的创意和想法
        </p>
        <div style={{
          display: 'flex',
          gap: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button 
            className="btn btn-primary btn-xl" 
            onClick={() => navigate('/login')}
          >
            立即登录
          </button>
          <button 
            className="btn btn-ghost btn-xl" 
            onClick={() => navigate('/register')}
          >
            免费注册
          </button>
        </div>
      </div>
    </Galaxy_backend>
  );
}

export default LandingPage;