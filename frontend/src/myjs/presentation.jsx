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
import { SlideChangeButtonBar } from './modal/SlideChangeButton';
import SlidePageControl from './modal/SlidePageControl';
import SlideArrow from './modal/SlideArrow';
import AddButton from './modal/AddButton';
import AddElementModal from './modal/AddElementModal';

const PresentationContainer = styled.div`
  background-color: #a594d8;
  min-height: 100vh;
  padding: 20px;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 1.8rem;
  color: white;
  margin-top: 26px;
  margin-bottom: 6px;

  @media (min-width: 600px) {
    font-size: 2rem;
    margin-top: 26px;
    margin-bottom: 16px;
  }
`;

const Button = styled.button`
  padding: 6px 15px;
  font-size: 0.9rem;
  color: #6950a1;
  background-color: white;
  border: 1px solid #6950a1;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  margin: 1px;
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
  
  @media (min-width: 600px) {
    padding: 10px 20px;
    font-size: 1rem;
    margin: 10px;
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
    axios.get('https://z5503600-presto-backend.vercel.app/store', {
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

  function handleUpdateThumbnail(index) {
    const updatedPresentation = {
      ...presentation,
      thumbnailSlideIndex: index,
    };
    updateStore(updatedPresentation);
    setThumbnailSlideIndex(index);
  }

  async function updateStore(updatedPresentation) {
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
      const response = await axios.get('https://z5503600-presto-backend.vercel.app/store', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const store = response.data.store || {};
      store[updatedPresentation.id] = updatedPresentation;
  
      await axios.put('https://z5503600-presto-backend.vercel.app/store', {
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

  function handleUpdateDescription() {
    const updatedPresentation = {
      ...presentation,
      description: newDescription,
    };
    updateStore(updatedPresentation);
    setShowDescriptionModal(false);
    setNewDescription('');
  };

  // add and delete slide
  async function handleAddSlide() {
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

  function handleDeleteSlide() {
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

  function handleNextSlide() {
    if (currentSlideIndex < presentation.slides.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      navigate(`/presentation/${id}/${newIndex}`);
    }
  };
  
  function handlePrevSlide() {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      navigate(`/presentation/${id}/${newIndex}`);
    }
  };

  function handleDeletePresentation() {
    setIsConfirmModalOpen(true);
  };

  function handleConfirmDelete() {
    setIsConfirmModalOpen(false);

    axios.get('https://z5503600-presto-backend.vercel.app/store', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        const store = response.data.store || {};
        delete store[presentation.id];

        return axios.put('https://z5503600-presto-backend.vercel.app/store', {
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

  function handleCancelDelete()  {
    setIsConfirmModalOpen(false);
  };

  function handleUpdateTitle() {
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

  function handleAddElement(type) {
    setModalType(type);
    setElementProperties({});
    setEditingElementId(null);
    setShowModal(true);
  };

  function handleSaveElement() {
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

  function handleDeleteElement(elementId) {
    const updatedPresentation = { ...presentation };
    updatedPresentation.slides[currentSlideIndex].elements = currentSlide.elements.filter(
      (el) => el.id !== elementId
    );
    updateStore(updatedPresentation);
  };

  function handleEditElement(element) {
    setModalType(element.type);
    setElementProperties({
      ...element.properties,
      size: element.size,
      position: element.position,
    });
    setEditingElementId(element.id);
    setShowModal(true);
  };

  function handleUpdateElement() {
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

  function renderElements() {
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
  function handleMoveOrResizeEnd() {
    updateStore(presentation);
  };

  // animation
  function toggleAnimations() {
    const newAnimationsEnabled = !animationsEnabled;
    const updatedPresentation = { ...presentation, animationsEnabled: newAnimationsEnabled };
    setPresentation(updatedPresentation);
    setAnimationsEnabled(newAnimationsEnabled);
    updateStore(updatedPresentation);
  };

  // handle rearrange
  function handleRearrangeSlides(newSlidesOrder) {
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

  // handle preview
  function handlePreview() {
    window.open(`/preview/${presentation.id}/${currentSlideIndex}`, '_blank');
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

      <SlideChangeButtonBar
        onBackgroundChange={() => setShowBackgroundModal(true)}
        onToggleAnimations={toggleAnimations}
        animationsEnabled={animationsEnabled}
        onRearrangeSlides={() => setShowRearrangeModal(true)}
        onRevisionHistory={() => setShowRevisionModal(true)}
      />

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

      {showRearrangeModal && (
        <RearrangeSlides
          slides={presentation.slides}
          defaultBackground={presentation.defaultBackground}
          onRearrange={handleRearrangeSlides}
          onClose={() => setShowRearrangeModal(false)}
        />
      )}

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
            <SlideArrow
              handlePrevSlide={handlePrevSlide}
              handleNextSlide={handleNextSlide}
              currentSlideIndex={currentSlideIndex}
              totalSlides={presentation.slides.length}
            />
          </>
        )}
      </div>
      
      <SlidePageControl
        handleAddSlide={handleAddSlide}
        handleDeleteSlide={handleDeleteSlide}
        onPreview={handlePreview}
        isNotificationOpen={isNotificationOpen}
        setNotificationOpen={setNotificationOpen}
        NotificationModal={NotificationModal}
      />

      <AddButton handleAddElement={handleAddElement} />

      <AddElementModal
        showModal={showModal}
        modalType={modalType}
        editingElementId={editingElementId}
        elementProperties={elementProperties}
        setElementProperties={setElementProperties}
        handleSaveElement={handleSaveElement}
        handleUpdateElement={handleUpdateElement}
        setShowModal={setShowModal}
        handleImageFileChange={handleImageFileChange}
      />
    </PresentationContainer>
  );
}

export default Presentation;