import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import SlideThumbnail from './SlideThumbnail';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #6950a1;
  color: white;
  min-height: 100vh;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  color: #6950a1;
  background-color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  margin: 10px;
  transition: background-color 0.3s ease, transform 0.1s ease;

  &:hover {
    background-color: #ddd;
  }

  &:active {
    background-color: #afb4db;
    transform: scale(0.98);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 20px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  text-align: center;
  color: #6950a1;
`;

const PresentationList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const PresentationCard = styled.div`
  width: 360px;
  height: 180px;
  border: 1px solid #ccc;
  margin: 20px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-radius: 8px;
  color: #000;
`;

function Dashboard({ onLogout, token}) {
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
  }

  function handleCreatePresentation() {
    setShowModal(true);
  }

  function handleSavePresentation() {
    const newPresentation = {
      id: Date.now(),
      name: newPresentationName,
      description: '',
      thumbnailSlideIndex: 0,
      slides: [{ id: uuidv4(), elements: [] }],
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
  }

  function handlePresentationClick(id) {
    navigate(`/presentation/${id}`);
  }

  return (
    <DashboardContainer>
      <Title>Welcome to dashboard!</Title>
      <div>
        <Button onClick={handleLogout}>Log out</Button>
        <Button onClick={handleCreatePresentation}>New Presentation</Button>
      </div>

      {showModal && (
        <Modal>
          <h3>Create New Presentation</h3>
          <input
            type="text"
            value={newPresentationName}
            onChange={(e) => setNewPresentationName(e.target.value)}
            placeholder="Presentation Name"
            style={{ padding: '10px', width: '80%', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
          <div>
            <Button onClick={handleSavePresentation}>Create</Button>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </Modal>
      )}

      <PresentationList>
        {presentations.map((presentation) => (
          <PresentationCard
            key={presentation.id}
            onClick={() => handlePresentationClick(presentation.id)}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                overflow: 'hidden',
              }}
            >
              {presentation.slides && presentation.slides.length > 0 ? (
                <SlideThumbnail 
                  slide={{ 
                    ...presentation.slides[presentation.thumbnailSlideIndex || 0], 
                    background: presentation.slides[presentation.thumbnailSlideIndex || 0]?.background || presentation.defaultBackground || {} 
                  }} 
                />
              ) : (
                <SlideThumbnail />
              )}
            </div>
            <h3 style={{ margin: '5px 0', fontSize: '1em', fontWeight: 'bold' }}>{presentation.name}</h3>
            {presentation.description && (
              <p style={{ margin: '5px 0 0 0', fontSize: '0.85em' }}>{presentation.description}</p>
            )}
            <p style={{ fontSize: '0.85em', color: '#666' }}>Slides: {presentation.slides.length}</p>
          </PresentationCard>
        ))}
      </PresentationList>
    </DashboardContainer>
  );
}

export default Dashboard;