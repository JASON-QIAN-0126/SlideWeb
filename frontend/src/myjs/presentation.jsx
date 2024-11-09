import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import TextElement from './textelement';
import ImageElement from './imageelement';
import VideoElement from './videoelement';
import CodeElement from './codeelement';
import ThumbnailModal from './modal/UpdateThumbnailModal';
import BackgroundPicker from './background';
import NotificationModal from './modal/notificationmodal';
import MoveAndResize from './moveandresize';
import Animation from './animation';
import RearrangeSlides from './rearrange';
import RevisionHistory from './revision';

import styled from 'styled-components';
import DeletePresentation from './modal/DeletePresentation';
import ButtonBar from './modal/EditButton';
import EditModal from './modal/EditModal';

const PresentationContainer = styled.div`
  background-color: #a594d8;
  min-height: 100vh;
  padding: 20px;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  color: white;
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
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #6950a1;
    color: white;
    transform: scale(1.1);
  }

  &:active {
    background-color: #afb4db;
    transform: scale(0.98);
  }
`;

const BackButton = styled(Button)`
  position: absolute;
  top: 20px;
  left: 20px;
`;

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
  
  // query modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isNotificationOpen, setNotificationOpen] = useState(false);

  // add 'text', 'image', 'video', 'code'
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [elementProperties, setElementProperties] = useState({});
  const [editingElementId, setEditingElementId] = useState(null);
  const navigate = useNavigate();

  // background
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [isDefaultBackground, setIsDefaultBackground] = useState(false);

  // move and resize
  const [selectedElementId, setSelectedElementId] = useState(null);

  // animation
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  // rearrange
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);

  // revision
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [showRevisionModal, setShowRevisionModal] = useState(false);

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

  // Thumbnail and animation
  useEffect(() => {
    if (presentation && presentation.thumbnailSlideIndex !== undefined) {
      setThumbnailSlideIndex(presentation.thumbnailSlideIndex);
    } else {
      setThumbnailSlideIndex(0);
    }
  }, [presentation]);

  useEffect(() => {
    if (presentation && presentation.animationsEnabled !== undefined) {
      setAnimationsEnabled(presentation.animationsEnabled);
    } else {
      setAnimationsEnabled(false);
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
      const currentTime = Date.now();
      if (!lastSavedTime || currentTime - lastSavedTime >= 60000) {
        // save history if more than 1min
        const historyEntry = {
          timestamp: currentTime,
          slides: presentation.slides,
          animationsEnabled: presentation.animationsEnabled,
        };
        updatedPresentation.history = updatedPresentation.history || [];
        updatedPresentation.history.push(historyEntry);
        setLastSavedTime(currentTime);
      }
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

  // add and delete slide
  const handleAddSlide = async () => {
    const newSlide = {
      id: uuidv4(),
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
      setNotificationOpen(true);
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
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      navigate(`/presentation/${id}/${newIndex}`);
    }
  };
  
  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      navigate(`/presentation/${id}/${newIndex}`);
    }
  };

  const handleDeletePresentation = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsConfirmModalOpen(false);

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
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
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
          properties: updatedProperties,
        };
      }
      return el;
    });
    updatedPresentation.slides[currentSlideIndex].elements = elements;
    updateStore(updatedPresentation);
    setShowModal(false);
  };

  const handleElementClick = (e, element) => {
    e.stopPropagation();
    setSelectedElementId(element.id);
  };

  const updateElementPositionSize = (elementId, { position, size }) => {
    const updatedPresentation = { ...presentation };
    const elements = currentSlide.elements.map((el) => {
      if (el.id === elementId) {
        return {
          ...el,
          position: position,
          size: size,
        };
      }
      return el;
    });
    updatedPresentation.slides[currentSlideIndex].elements = elements;
    setPresentation(updatedPresentation);
  };

  const renderElements = () => {
    const elements = currentSlide.elements || [];
    return elements
      .sort((a, b) => a.layer - b.layer)
      .map((element) => {
        const isSelected = element.id === selectedElementId;

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
            onClick={(e) => handleElementClick(e, element)}
            onDoubleClick={() => handleEditElement(element)}
            onContextMenu={(e) => {
              e.preventDefault();
              handleDeleteElement(element.id);
            }}
          >
            {isSelected ? (
              <MoveAndResize
                element={element}
                updateElementPositionSize={updateElementPositionSize}
                onMoveOrResizeEnd={handleMoveOrResizeEnd}
              >
                {content}
              </MoveAndResize>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  top: `${element.position.y}%`,
                  left: `${element.position.x}%`,
                  width: `${element.size.width}%`,
                  height: `${element.size.height}%`,
                  border: '1px solid grey',
                  overflow: 'hidden',
                  cursor: 'pointer',
                }}
              >
                {content}
              </div>
            )}
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

  // background
  const slideBackground = currentSlide.background || presentation.defaultBackground || {};

  const slideStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '1000px',
    margin: '0 auto',
    aspectRatio: '16 / 9' ,
    border: '1px solid #000',
    backgroundColor: '#fff',
  };

  if (slideBackground.type === 'color') {
    slideStyle.backgroundColor = slideBackground.value;
  } else if (slideBackground.type === 'gradient') {
    slideStyle.backgroundImage = slideBackground.value;
  } else if (slideBackground.type === 'image') {
    slideStyle.backgroundImage = `url(${slideBackground.value})`;
    slideStyle.backgroundSize = 'cover';
  }

  const handleSetBackground = (background) => {
    let updatedPresentation = { ...presentation };
  
    if (isDefaultBackground) {
      updatedPresentation.defaultBackground = background;
    } else {
      updatedPresentation.slides = presentation.slides.map((slide, index) => {
        if (index === currentSlideIndex) {
          return {
            ...slide,
            background: background,
          };
        }
        return slide;
      });
    }
  
    updateStore(updatedPresentation);
    setIsDefaultBackground(false);
  };

  // move or resize
  const handleMoveOrResizeEnd = () => {
    updateStore(presentation);
  };

  // animation
  const toggleAnimations = () => {
    const newAnimationsEnabled = !animationsEnabled;
    const updatedPresentation = { ...presentation, animationsEnabled: newAnimationsEnabled };
    setPresentation(updatedPresentation);
    setAnimationsEnabled(newAnimationsEnabled);
    updateStore(updatedPresentation);
  };

  // handle rearrange
  const handleRearrangeSlides = (newSlidesOrder) => {
    const updatedPresentation = { ...presentation, slides: newSlidesOrder };
    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
    setShowRearrangeModal(false);
  };

  // handle history
  const handleRestoreRevision = (entry) => {
    const updatedPresentation = {
      ...presentation,
      slides: entry.slides,
      animationsEnabled: entry.animationsEnabled,
    };
    updateStore(updatedPresentation).then(() => {
      setCurrentSlideIndex((prevIndex) => {
        if (prevIndex >= updatedPresentation.slides.length) {
          return updatedPresentation.slides.length - 1;
        }
        return prevIndex;
      });
      setAnimationsEnabled(entry.animationsEnabled);
      setShowRevisionModal(false);
    });
  };

  return (
    <PresentationContainer>
      <Title>{presentation.name}</Title>
      <BackButton onClick={() => navigate('/dashboard')}>Back</BackButton>
      <DeletePresentation
        isConfirmModalOpen={isConfirmModalOpen} 
        handleDeletePresentation={handleDeletePresentation} 
        handleConfirmDelete={handleConfirmDelete} 
        handleCancelDelete={handleCancelDelete}
      />

      <ButtonBar
        onEditTitle={() => setShowTitleModal(true)}
        onEditDescription={() => setShowDescriptionModal(true)}
        onUpdateThumbnail={() => setShowThumbnailModal(true)}
      />

      {showTitleModal && (
        <EditModal
          title="Edit Title"
          value={newTitle}
          onChange={setNewTitle}
          onSave={handleUpdateTitle}
          onClose={() => setShowTitleModal(false)}
          placeholder="New Title"
          isTextArea={false}
        />
      )}

      {showDescriptionModal && (
        <EditModal
          title="Edit Description"
          value={newDescription}
          onChange={setNewDescription}
          onSave={handleUpdateDescription}
          onClose={() => setShowDescriptionModal(false)}
          placeholder="New Description"
          isTextArea={true}
        />
      )}

      {showThumbnailModal && (
        <ThumbnailModal
          presentation={presentation}
          thumbnailSlideIndex={thumbnailSlideIndex}
          handleUpdateThumbnail={handleUpdateThumbnail}
          onClose={() => setShowThumbnailModal(false)}
        />
      )}

      <button onClick={() => setShowBackgroundModal(true)}>Change Background</button>
      <BackgroundPicker
        show={showBackgroundModal}
        onClose={() => {
          setShowBackgroundModal(false);
          setIsDefaultBackground(false);
        }}
        onApply={handleSetBackground}
        currentBackground={currentSlide.background || {}}
        isDefault={isDefaultBackground}
        setIsDefault={setIsDefaultBackground}
      />

      <button onClick={toggleAnimations}>
        {animationsEnabled ? 'Disable Animation' : 'Add Animation'}
      </button>

      <button onClick={() => setShowRearrangeModal(true)}>Rearrange Slides</button>
      {showRearrangeModal && (
        <RearrangeSlides
          slides={presentation.slides}
          onRearrange={handleRearrangeSlides}
          onClose={() => setShowRearrangeModal(false)}
        />
      )}

      <button onClick={() => window.open(`/preview/${presentation.id}/${currentSlideIndex}`, '_blank')}>Preview</button>
      <button onClick={() => setShowRevisionModal(true)}>Revision History</button>
      {showRevisionModal && (
        <RevisionHistory
          history={presentation.history || []}
          onRestore={handleRestoreRevision}
          onClose={() => setShowRevisionModal(false)}
        />
      )}

      {/* slide content part */}
      <div
        className="slide-container"
        style={slideStyle}
      >
        {animationsEnabled ? (
          <Animation slideKey={currentSlideIndex}>
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
          </Animation>
        ) : (
          <>
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
          </>
        )}
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
        {isNotificationOpen && (
          <NotificationModal
            message="Cannot delete the only slide. Consider deleting the presentation."
            onClose={() => setNotificationOpen(false)}
          />
        )}
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
    </PresentationContainer>
  );
}

export default Presentation;