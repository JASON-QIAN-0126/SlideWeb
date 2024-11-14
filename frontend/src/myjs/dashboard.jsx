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
  font-size: 1.5rem;
  margin-bottom: 10px;

  @media (min-width: 600px) {
    font-size: 2.5rem;
    margin-bottom: 20px;
  }
`;

const Button = styled.button`
  padding: 6px 16px;
  font-size: 1rem;
  color: #6950a1;
  background-color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  margin: 10px;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #9999cc;
    color: white;
    transform: scale(1.1);
  }

  &:active {
    background-color: #afb4db;
    transform: scale(0.98);
  }
  
  @media (min-width: 600px) {
    padding: 10px 20px;
    font-size: 1rem;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  text-align: center;
  color: #6950a1;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const PresentationList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const PresentationCard = styled.div`
  width: 330px;
  height: 165px;
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
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: #494e8f;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (min-width: 600px) {
    width: 360px;
    height: 180px;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 10px;
`;

const CreateButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #6950a1;
  border-radius: 5px;
  cursor: pointer;
  background-color: #6950a1;
  color: white;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #4d3a78;
    transform: scale(1.05);
  }
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #6950a1;
  border-radius: 5px;
  cursor: pointer;
  background-color: white;
  color: #6950a1;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #ddd;
    transform: scale(1.05);
  }
`;

function Dashboard({ onLogout, token}) {
  const [presentations, setPresentations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState('');
  const [newPresentationDescription, setNewPresentationDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('https://z5503600-presto-backend.vercel.app/store', {
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

  function handleCancel() {
    setShowModal(false);
    setNewPresentationName('');
    setNewPresentationDescription('');
  }
  
  function handleSavePresentation() {
    const newPresentation = {
      id: Date.now(),
      name: newPresentationName,
      description: newPresentationDescription,
      thumbnailSlideIndex: 0,
      slides: [{ id: uuidv4(), elements: [] }],
    };

    const savePresentation = () => {
      axios
        .get('https://z5503600-presto-backend.vercel.app/store', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const store = response.data.store || {};
          store[newPresentation.id] = newPresentation;

          return axios.put(
            'https://z5503600-presto-backend.vercel.app/store',
            {
              store: store,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        })
        .then(() => {
          setPresentations([...presentations, newPresentation]);
          setShowModal(false);
          setNewPresentationName('');
          setNewPresentationDescription('');
          console.log('Presentation saved successfully in global store');
        })
        .catch((err) => {
          console.error('Failed to save presentation', err);
        });
    };
    savePresentation();
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
        <ModalOverlay>
          <Modal>
            <h3>Create New Presentation</h3>
            <input
              type="text"
              value={newPresentationName}
              onChange={(e) => setNewPresentationName(e.target.value)}
              placeholder="Presentation Name"
              style={{
                padding: '10px',
                width: '80%',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginBottom: '10px',
              }}
            />

            <input
              type="text"
              value={newPresentationDescription}
              onChange={(e) => setNewPresentationDescription(e.target.value)}
              placeholder="Description"
              style={{
                padding: '10px',
                width: '80%',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginBottom: '10px',
              }}
            />
            <label style={{display: 'block', marginBottom: '5px' }}>Thumbnail can be chosen in each presentation</label>
            <label style={{display: 'block', marginBottom: '5px' }}>(default wil be slide 1)</label>
            <ButtonContainer>
              <CancelButton onClick={handleCancel}>Cancel</CancelButton>
              <CreateButton onClick={handleSavePresentation}>Create</CreateButton>
            </ButtonContainer>
          </Modal>
        </ModalOverlay>
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
                height: '80%',
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
            <div style={{ width: '100%', padding: '5px 0' }}>
              <h3 style={{ margin: '2px 0', fontSize: '0.9em', fontWeight: 'bold', textAlign: 'center' }}>
                {presentation.name}
              </h3>
              {presentation.description && (
                <p style={{ margin: '2px 0', fontSize: '0.75em', textAlign: 'center' }}>
                  {presentation.description}
                </p>
              )}
              <p style={{ fontSize: '0.75em', color: '#666', textAlign: 'center', margin: '2px 0' }}>
                Slides: {presentation.slides.length}
              </p>
            </div>
          </PresentationCard>
        ))}
      </PresentationList>
    </DashboardContainer>
  );
}

export default Dashboard;