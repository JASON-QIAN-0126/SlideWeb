import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogout, token }) {
  const [presentations, setPresentations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState('');
  const navigate = useNavigate();


  useEffect(() => {
    axios.get('http://localhost:5005/store', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        setPresentations(response.data.presentations || []);
      })
      .catch((err) => {
        console.error('Failed to fetch presentations', err);
      });
  }, [token]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const handleCreatePresentation = () => {
    setShowModal(true);
  };

  const handleSavePresentation = () => {
    const newPresentation = {
      id: Date.now(), // 简单的唯一ID
      name: newPresentationName,
      slides: [{ id: 1, content: '' }], // 默认包含一个空白幻灯片
    };

    // 更新后端存储
    axios.put('http://localhost:5005/store', {
      presentations: [...presentations, newPresentation],
    }, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(() => {
        setPresentations([...presentations, newPresentation]);
        setShowModal(false);
        setNewPresentationName('');
      })
      .catch((err) => {
        console.error('Failed to save presentation', err);
      });
  };

  const handlePresentationClick = (id) => {
    navigate(`/presentation/${id}`);
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Log out</button>
      <button onClick={handleCreatePresentation}>New Presentation</button>

      {showModal && (
        <div className="modal">
          <h3>Create New Presentation</h3>
          <input
            type="text"
            value={newPresentationName}
            onChange={(e) => setNewPresentationName(e.target.value)}
            placeholder="Presentation Name"
          />
          <button onClick={handleSavePresentation}>Create</button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}

      <div className="presentation-list">
        {presentations.map((presentation) => (
          <div
            key={presentation.id}
            className="presentation-card"
            onClick={() => handlePresentationClick(presentation.id)}
            style={{
              width: '200px',
              height: '100px', // 2:1 ratio
              border: '1px solid #ccc',
              margin: '10px',
              cursor: 'pointer',
              display: 'inline-block',
              position: 'relative',
            }}
          >
            <div
              className="thumbnail"
              style={{
                width: '100%',
                height: '70%',
                backgroundColor: '#eee',
              }}
            >
              {/* 如果有缩略图，显示缩略图 */}
            </div>
            <h3 style={{ margin: '5px 0' }}>{presentation.name}</h3>
            {presentation.description && <p>{presentation.description}</p>}
            <p>Slides: {presentation.slides.length}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;