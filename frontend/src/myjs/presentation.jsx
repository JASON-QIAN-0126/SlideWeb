import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // for id
import TextElement from './textelement';
// import ImageElement from 'imageelement';
// import VideoElement from 'videoelement';
// import CodeElement from 'codeelement';

function Presentation({ token }) {
  const { id } = useParams();
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'text', 'image', 'video', 'code'
  const [elementProperties, setElementProperties] = useState({});
  const [editingElementId, setEditingElementId] = useState(null);
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

  const updateStore = async (updatedPresentation) => {
    try {
      const response = await axios.get('http://localhost:5005/store', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const store = response.data.store || {};
      store[updatedPresentation.id] = updatedPresentation;
  
      await axios.put('http://localhost:5005/store', {
        store: store,
      }, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setPresentation(updatedPresentation);
      return updatedPresentation;
    } catch (err) {
      console.error('Failed to update store', err);
    }
  };

  const handleAddSlide = async () => {
    const newSlide = {
      id: Date.now(),
      elements: [],
    };
    const updatedPresentation = {
      ...presentation,
      slides: [...presentation.slides, newSlide],
    };
    const newPresentation = await updateStore(updatedPresentation);
    if (newPresentation) {
      setCurrentSlideIndex(newPresentation.slides.length - 1);
    }
  };

  const handleDeleteSlide = () => {
    if (presentation.slides.length === 1) {
      alert('Cannot delete the only slide. Consider deleting the presentation.');
      return;
    }
    const updatedSlides = presentation.slides.filter(
      (_, index) => index !== currentSlideIndex
    );
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

    const handleDeletePresentation = () => {
        const confirmDelete = window.confirm('Are you sure you want to delete this presentation?');
        if (confirmDelete) {
        axios.get('http://localhost:5005/store', {
            headers: { 'Authorization': `Bearer ${token}` },
        })
            .then((response) => {
            const store = response.data.store || {};
            delete store[presentation.id];

            return axios.put('http://localhost:5005/store', {
                store: store,
            }, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            })
            .then(() => {
            navigate('/dashboard');
            })
            .catch((err) => {
            console.error('Failed to delete presentation', err);
            });
        }
    };

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

  if (!currentSlide) {
    return <div>Loading slide...</div>;
  }

  const handleAddElement = (type) => {
    setModalType(type);
    setElementProperties({});
    setEditingElementId(null);
    setShowModal(true);
  };

  const handleSaveElement = () => {
    let updatedProperties = { ...elementProperties };
    if (modalType === 'video') {
      const videoId = parseYouTubeId(elementProperties.videoUrl);
      if (videoId) {
        updatedProperties.videoId = videoId;
      } else {
        alert('Invalid YouTube URL');
        return;
      }
    }
    const newElement = {
      id: uuidv4(),
      type: modalType,
      position: { x: 0, y: 0 },
      size: {
        width: parseFloat(elementProperties.size?.width) || 0,
        height: parseFloat(elementProperties.size?.height) || 0,
      },
      properties: updatedProperties,
      layer: Date.now(),
    };
    const updatedPresentation = { ...presentation };
    updatedPresentation.slides[currentSlideIndex].elements = [
      ...(currentSlide.elements || []),
      newElement,
    ];
    updateStore(updatedPresentation);
    setShowModal(false);
  };

  const handleDeleteElement = (elementId) => {
    const updatedPresentation = { ...presentation };
    updatedPresentation.slides[currentSlideIndex].elements = currentSlide.elements.filter(
      (el) => el.id !== elementId
    );
    updateStore(updatedPresentation);
  };

  const handleEditElement = (element) => {
    setModalType(element.type);
    setElementProperties({
      ...element.properties,
      size: element.size,
      position: element.position,
    });
    setEditingElementId(element.id);
    setShowModal(true);
  };

  // update element

  const renderElements = () => {
    const elements = currentSlide.elements || [];
    return elements
      .sort((a, b) => a.layer - b.layer)
      .map((element) => {
        const style = {
          position: 'absolute',
          top: `${element.position.y}%`,
          left: `${element.position.x}%`,
          width: `${element.size.width}%`,
          height: `${element.size.height}%`,
          border: '1px solid grey',
          overflow: 'hidden',
          cursor: 'pointer',
        };
  
        let content = null;
        switch (element.type) {
          case 'text':
            content = <TextElement element={element} onEdit={handleEditElement} />;
            break;
          case 'image':
            content = <ImageElement element={element} onEdit={handleEditElement} />;
            break;
          case 'video':
            content = <VideoElement element={element} onEdit={handleEditElement} />;
            break;
          case 'code':
            content = <CodeElement element={element} onEdit={handleEditElement} />;
            break;
          default:
            break;
        }
  
        return (
          <div
            key={element.id}
            style={style}
            onContextMenu={(e) => {
              e.preventDefault();
              handleDeleteElement(element.id);
            }}
          >
            {content}
          </div>
        );
      });
  };

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

<div
        className="slide-container"
        style={{
          position: 'relative',
          width: '600px',
          height: '400px',
          border: '1px solid #000',
        }}
      >
        {renderElements()}
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
        <button
          onClick={handlePrevSlide}
          disabled={currentSlideIndex === 0}
          style={{ position: 'absolute', top: '50%', left: '0' }}
        >
          &lt;
        </button>
        <button
          onClick={handleNextSlide}
          disabled={currentSlideIndex === presentation.slides.length - 1}
          style={{ position: 'absolute', top: '50%', right: '0' }}
        >
          &gt;
        </button>
      </div>

      
    </div>
  );
}

export default Presentation;