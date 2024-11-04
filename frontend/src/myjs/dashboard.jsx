import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogout }) {
    const navigate = useNavigate();
  
    const handleLogout = () => {
      onLogout();
      navigate('/');
    };
  
    return (
      <div>
        <h2>Dashboard</h2>
        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  }
  
  export default Dashboard;