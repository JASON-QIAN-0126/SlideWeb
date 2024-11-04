import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './myjs/landpage';
import Login from './myjs/login';
import Register from './myjs/register';
import Dashboard from './myjs/dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      {isAuthenticated && <button onClick={() => setIsAuthenticated(false)}>Logout</button>}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <Login onLogin={() => setIsAuthenticated(true)} isAuthenticated={isAuthenticated} />
          }
        />
        <Route
          path="/register"
          element={
            <Register onRegister={() => setIsAuthenticated(true)} isAuthenticated={isAuthenticated} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;