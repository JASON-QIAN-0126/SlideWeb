import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../utils/api.js';
import Galaxy_backend from '../Galaxy/Galaxy_backend';
import '../styles/auth.css';

function Login({ onLogin, isAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await api.auth.login(email, password);
      const token = response.data.token;
      onLogin(token);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('登录失败，请检查网络连接');
      }
    }
  }

  function handleGuestLogin() {
    // 游客登录，直接进入dashboard，不与后端连接
    onLogin('guest-token');
  }
  
  return (
    <Galaxy_backend variant="auth">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">欢迎回来</h1>
            <p className="auth-subtitle">登录您的Love Slide账户</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">邮箱地址</label>
              <input
                className="auth-input"
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入您的邮箱"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">密码</label>
              <input
                className="auth-input"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入您的密码"
                required
              />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <div className="btn-group">
              <button className="btn btn-outline" type="button" onClick={() => navigate('/')}>
                返回
              </button>
              <button className="auth-submit" type="submit">
                登录
              </button>
            </div>
          </form>
          
          <div className="auth-link">
            <span className="auth-link-text">还没有账户？</span>
            <a className="auth-link-button" href="/register">立即注册</a>
          </div>
          
          <div className="auth-divider">
            <span>或者</span>
          </div>
          
          <button className="auth-guest-btn" onClick={handleGuestLogin}>
            游客登录
          </button>
        </div>
      </div>
    </Galaxy_backend>
  );
}

export default Login;