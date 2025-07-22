import { useState } from 'react';
import { Navigate,useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';
import Galaxy_backend from '../components/Galaxy_backend';
import '../styles/auth.css';

function Register({ onRegister, isAuthenticated }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Password does not match!');
      return;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/admin/auth/register`, {
        email,
        password,
        name,
      });
      const token = response.data.token;
      onRegister(token);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to register');
      }
    }
  };


  return (
    <Galaxy_backend variant="auth">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">加入Presto</h1>
            <p className="auth-subtitle">创建您的演示文稿账户</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">姓名</label>
              <input
                className="auth-input"
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入您的姓名"
                required
              />
            </div>
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
                placeholder="请输入密码"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">确认密码</label>
              <input
                className="auth-input"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入密码"
                required
              />
              {password && confirmPassword && (
                <div className={`password-match-info ${password === confirmPassword ? 'success' : 'error'}`}>
                  {password === confirmPassword ? '密码匹配' : '密码不匹配'}
                </div>
              )}
            </div>
            {error && <div className="auth-error">{error}</div>}
            <div className="btn-group">
              <button className="btn btn-outline" type="button" onClick={() => navigate('/')}>
                返回
              </button>
              <button className="auth-submit" type="submit">
                注册
              </button>
            </div>
          </form>
          <div className="auth-link">
            <span className="auth-link-text">已有账户？</span>
            <a className="auth-link-button" href="/login">立即登录</a>
          </div>
        </div>
      </div>
    </Galaxy_backend>
  );
}

export default Register;