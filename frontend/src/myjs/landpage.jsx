import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <h1>Welcome to Presto!</h1>
      <Link to="/login">Log in</Link> | <Link to="/register">Register</Link>
    </div>
  );
}

export default LandingPage;