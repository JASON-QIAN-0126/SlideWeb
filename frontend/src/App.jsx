import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './myjs/landpage';
import Login from './myjs/login';
import Register from './myjs/register';
import Dashboard from './myjs/dashboard';
import Presentation from './myjs/presentation';
import Preview from './myjs/preview';
import GalaxyTest from './Galaxy/test';
import { api } from './utils/api.js';

function App() {
  const [token, setToken] = useState(null);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token); // store token
  };

  const handleLogout = async () => {
    try {
      await api.auth.logout();
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
            <Register onLogin={handleLogin} isAuthenticated={!!token} />
          }
        />
        <Route
          path="/dashboard"
          element={
            token ? <Dashboard onLogout={handleLogout} token={token} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/presentation/:id"
          element={
            token ? (
              <Presentation token={token} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route 
          path="/presentation/:id/:slideIndex?" 
          element={<Presentation token={token} />} 
        />
        <Route
          path="/preview/:id/:slideIndex?"
          element={<Preview token={token} />}
        />
        <Route
          path="/galaxy-test"
          element={<GalaxyTest />}
        />
      </Routes>
    </Router>
  );
}

export default App;