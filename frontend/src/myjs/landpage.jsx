import React from 'react';
import { useNavigate } from 'react-router-dom';
import Galaxy_backend from '../Galaxy/Galaxy_backend';
import TextType from '../components/TextType/TextType';
import '../styles/landing.css';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <Galaxy_backend variant="landing">
      <div className="top-navbar">
        <div className="top-navbar-content">
          <div className="react-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
              <g fill="#61DAFB">
                <circle cx="12" cy="12" r="2"/>
                        <ellipse cx="12" cy="12" rx="11" ry="4" stroke="#61DAFB" strokeWidth="2" fill="none"/>
        <ellipse cx="12" cy="12" rx="11" ry="4" stroke="#61DAFB" strokeWidth="2" fill="none" transform="rotate(60 12 12)"/>
        <ellipse cx="12" cy="12" rx="11" ry="4" stroke="#61DAFB" strokeWidth="2" fill="none" transform="rotate(120 12 12)"/>
              </g>
            </svg>
          </div>
          <TextType
            text="Welcome to Slide Website build by React"
            as="span"
            className="top-navbar-text"
            typingSpeed={120}
            loop={false}
            showCursor={false}
          />
        </div>
      </div>

      <div className="github-button-top-right">
        <div className="github-button-icon" onClick={() => window.open('https://github.com/JASON-QIAN-0126/SlideWeb', '_blank')}>
          <div className="github-icon">
            <svg viewBox="0 0 24 24">
              <path
                fill="#222229"
                d="M12 0.296997C5.37 0.296997 0 5.67 0 12.297C0 17.6 3.438 22.097 8.205 23.682C8.805 23.795 9.025 23.424 9.025 23.105C9.025 22.82 9.015 22.065 9.01 21.065C5.672 21.789 4.968 19.455 4.968 19.455C4.422 18.07 3.633 17.7 3.633 17.7C2.546 16.956 3.717 16.971 3.717 16.971C4.922 17.055 5.555 18.207 5.555 18.207C6.625 20.042 8.364 19.512 9.05 19.205C9.158 18.429 9.467 17.9 9.81 17.6C7.145 17.3 4.344 16.268 4.344 11.67C4.344 10.36 4.809 9.29 5.579 8.45C5.444 8.147 5.039 6.927 5.684 5.274C5.684 5.274 6.689 4.952 8.984 6.504C9.944 6.237 10.964 6.105 11.984 6.099C13.004 6.105 14.024 6.237 14.984 6.504C17.264 4.952 18.269 5.274 18.269 5.274C18.914 6.927 18.509 8.147 18.389 8.45C19.154 9.29 19.619 10.36 19.619 11.67C19.619 16.28 16.814 17.295 14.144 17.59C14.564 17.95 14.954 18.686 14.954 19.81C14.954 21.416 14.939 22.706 14.939 23.096C14.939 23.411 15.149 23.786 15.764 23.666C20.565 22.092 24 17.592 24 12.297C24 5.67 18.627 0.296997 12 0.296997Z"
              ></path>
            </svg>
          </div>
          <div className="github-cube">
            <span className="github-side github-side-front">get source code</span>
            <span className="github-side github-side-top">on github</span>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        color: 'white',
        padding: '20px',
        marginTop: '60px'
      }}>

        <div className="circular-subtitle">
          <div className="circular-text-container">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" fill="none"/>
        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" fill="none"/>
        <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" fill="none"/>
              </svg>
            <span className="circular-text">Use Slide to show your idea anytime!</span>
          </div>
        </div>

        <h1 style={{
          fontSize: '4.5rem',
          fontWeight: '700',
          color: 'white',
          textShadow: '0 4px 16px rgba(255, 255, 255, 0.3)',
          marginBottom: '30px',
          letterSpacing: '-0.02em',
          fontFamily: 'Inter, sans-serif',
          background: 'linear-gradient(135deg, #ffffff 0%, #e5e5e5 50%, #cccccc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 4px 8px rgba(255, 255, 255, 0.1))',
          animation: 'fadeIn 1s ease-in-out 0.5s both',
          lineHeight: '1.2'
        }}>
          <div>Written in the Stars,</div>
          <div>Captured in Slides</div>
        </h1>
        
        <div style={{
          display: 'flex',
          gap: '30px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          animation: 'fadeIn 0.8s ease-in-out 0.8s both'
        }}>
          <button 
            className="normal-btn normal-btn-signin" 
            onClick={() => navigate('/login')}
          >
            Get Started
          </button>
          
          <button 
            className="normal-btn normal-btn-learnmore" 
            onClick={() => window.open('https://github.com/JASON-QIAN-0126/SlideWeb', '_blank')}
          >
            Learn More
          </button>
        </div>
      </div>
    </Galaxy_backend>
  );
}

export default LandingPage; 