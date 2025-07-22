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

import { API_BASE_URL } from '../config.js';
import '../styles/presentation.css';
import DeletePresentation from './modal/DeletePresentation';
import ButtonBar from './modal/EditButton';
import EditModal from './modal/EditModal';
import { SlideChangeButtonBar } from './modal/SlideChangeButton';
import SlidePageControl from './modal/SlidePageControl';
import SlideArrow from './modal/SlideArrow';
import AddButton from './modal/AddButton';
import AddElementModal from './modal/AddElementModal';

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
    axios.get(`${API_BASE_URL}/store`, {
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
      const response = await axios.get(`${API_BASE_URL}/store`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const store = response.data.store || {};
      store[updatedPresentation.id] = updatedPresentation;
  
      await axios.put(`${API_BASE_URL}/store`, {
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

    axios.get(`${API_BASE_URL}/store`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        const store = response.data.store || {};
        delete store[presentation.id];

        return axios.put(`${API_BASE_URL}/store`, {
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
    <div className="presentation-container">
      <h1 className="presentation-title">{presentation.name}</h1>
      
      <button className="back-btn" onClick={() => navigate('/dashboard')}>
        返回
      </button>
      
      <button className="delete-presentation-btn" onClick={handleDeletePresentation}>
        删除演示文稿
      </button>

      {isConfirmModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">删除确认</h3>
            <p>您确定要删除这个演示文稿吗？</p>
            <div className="modal-actions">
              <button className="btn-modal-secondary" onClick={handleCancelDelete}>取消</button>
              <button className="btn-modal-primary" onClick={handleConfirmDelete}>确认删除</button>
            </div>
          </div>
        </div>
      )}

      <div className="toolbar-container">
        <div className="main-toolbar">
          <div className="toolbar-group left">
            <div className="toolbar-section">
              <h4 className="toolbar-section-title">编辑</h4>
              <div className="toolbar-section-buttons">
                <button className="toolbar-btn" onClick={() => setShowTitleModal(true)}>
                  编辑标题
                </button>
                <button className="toolbar-btn" onClick={() => setShowDescriptionModal(true)}>
                  编辑描述
                </button>
                <button className="toolbar-btn" onClick={() => setShowThumbnailModal(true)}>
                  更新缩略图
                </button>
              </div>
            </div>
          </div>
          
          <div className="toolbar-group center">
            <div className="toolbar-section">
              <h4 className="toolbar-section-title">幻灯片控制</h4>
              <div className="toolbar-section-buttons">
                <button className="toolbar-btn secondary" onClick={() => setShowBackgroundModal(true)}>
                  更改背景
                </button>
                <button 
                  className={`toolbar-btn ${animationsEnabled ? 'success' : ''}`} 
                  onClick={toggleAnimations}
                >
                  {animationsEnabled ? '禁用动画' : '启用动画'}
                </button>
                <button className="toolbar-btn" onClick={() => setShowRearrangeModal(true)}>
                  重排幻灯片
                </button>
                <button className="toolbar-btn" onClick={() => setShowRevisionModal(true)}>
                  历史版本
                </button>
              </div>
            </div>
          </div>
          
          <div className="toolbar-group right">
            <div className="toolbar-section">
              <h4 className="toolbar-section-title">操作</h4>
              <div className="toolbar-section-buttons">
                <button className="toolbar-btn primary" onClick={handleAddSlide}>
                  添加幻灯片
                </button>
                <button className="toolbar-btn danger" onClick={handleDeleteSlide}>
                  删除幻灯片
                </button>
                <button className="toolbar-btn success" onClick={handlePreview}>
                  预览
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTitleModal && (
        <EditModal
          title="编辑标题"
          value={newTitle}
          onChange={setNewTitle}
          onSave={handleUpdateTitle}
          onClose={() => setShowTitleModal(false)}
          placeholder="新标题"
          isTextArea={false}
        />
      )}

      {showDescriptionModal && (
        <EditModal
          title="编辑描述"
          value={newDescription}
          onChange={setNewDescription}
          onSave={handleUpdateDescription}
          onClose={() => setShowDescriptionModal(false)}
          placeholder="新描述"
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

      {/* 幻灯片内容 */}
      <div className="slide-container" style={slideStyle}>
        {animationsEnabled ? (
          <Animation slideKey={currentSlideIndex}>
            {renderElements()}
            <div className="slide-number">
              {currentSlideIndex + 1}
            </div>
          </Animation>
        ) : (
          <>
            {renderElements()}
            <div className="slide-number">
              {currentSlideIndex + 1}
            </div>
          </>
        )}
        {presentation.slides.length > 1 && (
          <SlideArrow
            handlePrevSlide={handlePrevSlide}
            handleNextSlide={handleNextSlide}
            currentSlideIndex={currentSlideIndex}
            totalSlides={presentation.slides.length}
          />
        )}
      </div>

      {/* 添加元素工具栏 */}
      <div className="toolbar-container">
        <div className="main-toolbar">
          <div className="toolbar-group center">
            <div className="toolbar-section">
              <h4 className="toolbar-section-title">添加元素</h4>
              <div className="toolbar-section-buttons">
                <button className="toolbar-btn secondary" onClick={() => handleAddElement('text')}>
                  📝 文本
                </button>
                <button className="toolbar-btn secondary" onClick={() => handleAddElement('image')}>
                  🖼️ 图片
                </button>
                <button className="toolbar-btn secondary" onClick={() => handleAddElement('video')}>
                  🎥 视频
                </button>
                <button className="toolbar-btn secondary" onClick={() => handleAddElement('code')}>
                  💻 代码
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isNotificationOpen && (
        <NotificationModal
          message="无法删除唯一的幻灯片。请考虑删除整个演示文稿。"
          onClose={() => setNotificationOpen(false)}
        />
      )}

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
    </div>
  );
}

export default Presentation;