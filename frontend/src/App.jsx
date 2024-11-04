import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './myjs/landpage';
import Login from './myjs/login';
import Register from './myjs/register';
import Dashboard from './myjs/dashboard';
import axios from 'axios';

function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token); // store token
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to log out', err);
    } finally {
      setToken(null);
      localStorage.removeItem('token'); // remove token
    }
  };

  useEffect(() => {
    // check token
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <Login onLogin={handleLogin} isAuthenticated={!!token} />
          }
        />
        <Route
          path="/register"
          element={
            <Register onRegister={handleLogin} isAuthenticated={!!token} />
          }
        />
        <Route
          path="/dashboard"
          element={
            token ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;