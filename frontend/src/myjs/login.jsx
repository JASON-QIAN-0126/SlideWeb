import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

function Login({ onLogin, isAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'user@example.com' && password === 'password') {
      onLogin();
    } else {
      setError('Uncorrect email or password');
    }
  };

  return (
    <div>
      <h2>Log in</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required // needed to be fillede in or error pop
        /><br/>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Login;