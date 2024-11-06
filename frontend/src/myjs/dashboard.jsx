import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SlideThumbnail from './SlideThumbnail';

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
      description: '',
      thumbnailSlideIndex: 0,
      slides: [{ id: Date.now(), elements: [] }],
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
              width: '360px',
              height: '180px',
              border: '1px solid #ccc',
              margin: '20px',
              cursor: 'pointer',
              display: 'inline-flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              alignItems: 'center',
              padding: '10px',
            }}
          >
            <div
              className="thumbnail"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* 渲染缩略图幻灯片 */}
              {presentation.slides && presentation.slides.length > 0 ? (
                <SlideThumbnail 
                  slide={{ 
                    ...presentation.slides[presentation.thumbnailSlideIndex || 0], 
                    background: presentation.slides[presentation.thumbnailSlideIndex || 0].background || presentation.defaultBackground || {} 
                  }} 
                />
              ) : (
                <SlideThumbnail />
              )}
            </div>
            <div
              style={{
                alignSelf: 'flex-start',
                color: '#000',
              }}
            >
              <h3 style={{ margin: '5px 0', fontSize: '1em', fontWeight: 'bold' }}>{presentation.name}</h3>
              {presentation.description && (
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85em' }}>{presentation.description}</p>
              )}
            </div>

            <div
              style={{
                alignSelf: 'flex-end',
                fontSize: '0.85em',
                color: '#666',
              }}
            >
              <p style={{ margin: '0' }}>Slides: {presentation.slides.length}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;