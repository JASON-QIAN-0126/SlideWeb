import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard({ onLogout, token }) {
  const [presentations, setPresentations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState('');
  // const thumbnailIndex = presentation.thumbnailSlideIndex || 0;
  const navigate = useNavigate();


  useEffect(() => {
    axios.get('http://localhost:5005/store', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        const store = response.data.store || {};
        const presentationsArray = Object.values(store);
        setPresentations(presentationsArray);
      })
      .catch((err) => {
        console.error('Failed to fetch presentations', err);
      });
  }, [token]);

  function handleLogout() {
    onLogout();
    navigate('/');
  };

  function handleCreatePresentation() {
    setShowModal(true);
  };


  function handleSavePresentation() {
    const newPresentation = {
      id: Date.now(),
      name: newPresentationName,
      slides: [{ id: 1, content: '' }],
    };

    axios.get('http://localhost:5005/store', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        const store = response.data.store || {};
        store[newPresentation.id] = newPresentation;

        return axios.put('http://localhost:5005/store', {
          store: store,
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(() => {
        setPresentations([...presentations, newPresentation]);
        setShowModal(false);
        setNewPresentationName('');
        console.log('Presentation saved successfully in global store');
      })
      .catch((err) => {
        console.error('Failed to save presentation', err);
      });
  };

  function handlePresentationClick(id) {
    navigate(`/presentation/${id}`);
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={handleLogout}>Log out</button>
      <button onClick={handleCreatePresentation}>New Presentation</button>


      {showModal && (
        <div className="modal" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          padding: '20px',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
        }}>
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
              height: '100px',
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
            />
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