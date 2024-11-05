// Presentation.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

function Presentation({ token }) {
  const { id } = useParams();
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:5005/store', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        const store = response.data.store || {};
        const presentationData = store[id];
        if (presentationData) {
          setPresentation(presentationData);
        } else {
          console.error('Presentation not found');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch presentation', err);
      });
  }, [id, token]);

  const updateStore = (updatedPresentation) => {
    axios.get('http://localhost:5005/store', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        const store = response.data.store || {};
        store[updatedPresentation.id] = updatedPresentation;

        return axios.put('http://localhost:5005/store', {
          store: store,
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
      })
      .then(() => {
        setPresentation(updatedPresentation);
      })
      .catch((err) => {
        console.error('Failed to update store', err);
      });
  };
    // add
  const handleDeleteSlide = () => {
    if (presentation.slides.length === 1) {
      alert('Cannot delete the only slide. Consider deleting the presentation.');
      return;
    }
    const updatedSlides = presentation.slides.filter((_, index) => index !== currentSlideIndex);
    const updatedPresentation = {
      ...presentation,
      slides: updatedSlides,
    };
    updateStore(updatedPresentation);

    setCurrentSlideIndex((prevIndex) => Math.max(0, prevIndex - 1));
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  // delete

  const handleUpdateTitle = () => {
    const updatedPresentation = {
      ...presentation,
      name: newTitle,
    };
    updateStore(updatedPresentation);
    setShowTitleModal(false);
    setNewTitle('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight') {
      handleNextSlide();
    } else if (e.key === 'ArrowLeft') {
      handlePrevSlide();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  if (!presentation) {
    return <div>Loading...</div>;
  }

  const currentSlide = presentation.slides[currentSlideIndex];

  return (
    <div>
        <h2>
        {presentation.name}
        <button onClick={() => setShowTitleModal(true)}>Edit Title</button>
        </h2>
        <button onClick={() => navigate('/dashboard')}>Back</button>
        <button onClick={handleDeletePresentation}>Delete Presentation</button>


        {showTitleModal && (
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
            <h3>Edit Title</h3>
            <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New Title"
            />
            <button onClick={handleUpdateTitle}>Update</button>
            <button onClick={() => setShowTitleModal(false)}>Cancel</button>
        </div>
        )}

      <div className="slide-container" style={{ position: 'relative', width: '600px', height: '400px', border: '1px solid #000' }}>
        <div className="slide-content">
          <p>{currentSlide.content}</p>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            fontSize: '1em',
            width: '50px',
            height: '50px',
          }}
        >
          {currentSlideIndex + 1}
        </div>
        <button onClick={handlePrevSlide} disabled={currentSlideIndex === 0} style={{ position: 'absolute', top: '50%', left: '0' }}>
          &lt;
        </button>
        <button onClick={handleNextSlide} disabled={currentSlideIndex === presentation.slides.length - 1} style={{ position: 'absolute', top: '50%', right: '0' }}>
          &gt;
        </button>
      </div>

      <button onClick={handleAddSlide}>Add Slide</button>
      <button onClick={handleDeleteSlide}>Delete Slide</button>
    </div>
  );
}

export default Presentation;