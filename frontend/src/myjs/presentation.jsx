import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // for id
import TextElement from './textelement';
import ImageElement from './imageelement';
import VideoElement from './videoelement';
import CodeElement from './codeelement';
import SlideThumbnail from './SlideThumbnail';

function Presentation({ token }) {
  const { id } = useParams();
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [thumbnailSlideIndex, setThumbnailSlideIndex] = useState(0);
  const [showThumbnailModal, setShowThumbnailModal] = useState(false);
  
  // add 'text', 'image', 'video', 'code'
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
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

  useEffect(() => {
    if (presentation && presentation.thumbnailSlideIndex !== undefined) {
      setThumbnailSlideIndex(presentation.thumbnailSlideIndex);
    } else {
      setThumbnailSlideIndex(0);
    }
  }, [presentation]);

  const handleUpdateThumbnail = (index) => {
    const updatedPresentation = {
      ...presentation,
      thumbnailSlideIndex: index,
    };
    updateStore(updatedPresentation);
    setThumbnailSlideIndex(index);
  };

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

  const handleUpdateDescription = () => {
    const updatedPresentation = {
      ...presentation,
      description: newDescription,
    };
    updateStore(updatedPresentation);
    setShowDescriptionModal(false);
    setNewDescription('');
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

  const handleUpdateElement = () => {
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
    const updatedPresentation = { ...presentation };
    const elements = currentSlide.elements.map((el) => {
      if (el.id === editingElementId) {
        return {
          ...el,
          size: {
            width: parseFloat(elementProperties.size?.width) || 0,
            height: parseFloat(elementProperties.size?.height) || 0,
          },
          position: {
            x: parseFloat(elementProperties.position?.x) || 0,
            y: parseFloat(elementProperties.position?.y) || 0,
          },
          properties: updatedProperties,
        };
      }
      return el;
    });
    updatedPresentation.slides[currentSlideIndex].elements = elements;
    updateStore(updatedPresentation);
    setShowModal(false);
  };

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
            onDoubleClick={() => handleEditElement(element)}
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

  const parseYouTubeId = (url) => {
    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setElementProperties({
          ...elementProperties,
          src: reader.result, // base64 string
        });
      };
      reader.readAsDataURL(file);
    }
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

        <button onClick={() => setShowDescriptionModal(true)}>Edit Description</button>
        {showDescriptionModal && (
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
            <h3>Edit Description</h3>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="New Description"
            />
            <button onClick={handleUpdateDescription}>Update</button>
            <button onClick={() => setShowDescriptionModal(false)}>Cancel</button>
          </div>
        )}
        
        <button onClick={() => setShowThumbnailModal(true)}>Update Thumbnail</button>
        {showThumbnailModal && (
          <div className="modal" style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: '#fff',
            padding: '20px',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}>
            <h3>Select Thumbnail Slide</h3>
            {presentation.slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => { handleUpdateThumbnail(index); setShowThumbnailModal(false); }}
                style={{
                  cursor: 'pointer',
                  marginBottom: '20px',
                  border: '1px solid #ccc',
                  padding: '10px',
                }}
              >
                <p>Slide {index + 1}</p>
                <SlideThumbnail slide={slide} />
              </div>
            ))}
            <button onClick={() => setShowThumbnailModal(false)}>Cancel</button>
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
        {presentation.slides.length > 1 && (
          <>
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
          </>
        )}
      </div>

      <div>
        <button onClick={handleAddSlide}>Add Slide</button>
        <button onClick={handleDeleteSlide}>Delete Slide</button>
      </div>

      <div>
        <button onClick={() => handleAddElement('text')}>Add Text</button>
        <button onClick={() => handleAddElement('image')}>Add Image</button>
        <button onClick={() => handleAddElement('video')}>Add Video</button>
        <button onClick={() => handleAddElement('code')}>Add Code</button>
      </div>

      {showModal && (
        <div
          className="modal"
          style={{
            position: 'fixed',
            top: '10%',
            left: '50%',
            transform: 'translate(-50%, 0)',
            backgroundColor: '#fff',
            padding: '20px',
            maxHeight: '80%',
            overflowY: 'auto',
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >
          <h3>{editingElementId ? 'Edit Element' : 'Add Element'}</h3>
          <label>
            Width (%):
            <input
              type="number"
              value={elementProperties.size?.width || ''}
              onChange={(e) =>
                setElementProperties({
                  ...elementProperties,
                  size: {
                    ...elementProperties.size,
                    width: e.target.value,
                  },
                })
              }
            />
          </label>
          <label>
            Height (%):
            <input
              type="number"
              value={elementProperties.size?.height || ''}
              onChange={(e) =>
                setElementProperties({
                  ...elementProperties,
                  size: {
                    ...elementProperties.size,
                    height: e.target.value,
                  },
                })
              }
            />
          </label>
          {editingElementId && (
            <>
              <label>
                X Position (%):
                <input
                  type="number"
                  value={elementProperties.position?.x || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      position: {
                        ...elementProperties.position,
                        x: e.target.value,
                      },
                    })
                  }
                />
              </label>
              <label>
                Y Position (%):
                <input
                  type="number"
                  value={elementProperties.position?.y || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      position: {
                        ...elementProperties.position,
                        y: e.target.value,
                      },
                    })
                  }
                />
              </label>
            </>
          )}
          {modalType === 'text' && (
            <>
              <label>
                Text:
                <textarea
                  value={elementProperties.text || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      text: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Font Size (em):
                <input
                  type="number"
                  value={elementProperties.fontSize || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      fontSize: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Font Family:
                <select
                  value={elementProperties.fontFamily || 'Arial'}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      fontFamily: e.target.value,
                    })
                  }
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </label>
              <label>
                Color (HEX):
                <input
                  type="text"
                  value={elementProperties.color || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      color: e.target.value,
                    })
                  }
                />
              </label>
            </>
          )}
          {modalType === 'image' && (
            <>
              <label>
                Image URL:
                <input
                  type="text"
                  value={elementProperties.src || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      src: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                OR Upload Image:
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                />
              </label>
              <label>
                Alt Text:
                <input
                  type="text"
                  value={elementProperties.alt || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      alt: e.target.value,
                    })
                  }
                />
              </label>
            </>
          )}
          {modalType === 'video' && (
            <>
              <label>
                YouTube Video URL:
                <input
                  type="text"
                  value={elementProperties.videoUrl || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      videoUrl: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Auto Play:
                <input
                  type="checkbox"
                  checked={elementProperties.autoplay || false}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      autoplay: e.target.checked,
                    })
                  }
                />
              </label>
            </>
          )}
          {modalType === 'code' && (
            <>
              <label>
                Code:
                <textarea
                  value={elementProperties.code || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      code: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Font Size (em):
                <input
                  type="number"
                  value={elementProperties.fontSize || ''}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      fontSize: e.target.value,
                    })
                  }
                />
              </label>
            </>
          )}
          <button onClick={editingElementId ? handleUpdateElement : handleSaveElement}>
            {editingElementId ? 'Update' : 'Add'}
          </button>
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default Presentation;