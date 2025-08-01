import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { api } from '../utils/api.js';
import TextElement from './textelement';
import ImageElement from './imageelement';
import VideoElement from './videoelement';
import CodeElement from './codeelement';

import BackgroundPicker from './background';
import NotificationModal from './modal/notificationmodal';
import MoveAndResize from './moveandresize';
import Animation from './animation';
import RearrangeSlides from './rearrange';
import RevisionHistory from './revision';
import SlideThumbnail from './SlideThumbnail';


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
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);

  // animations
  const [animationsEnabled, setAnimationsEnabled] = useState(false);

  // slide rearrange
  const [showRearrangeModal, setShowRearrangeModal] = useState(false);

  // revision history
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // drag and drop for slide reordering
  const [draggedIndex, setDraggedIndex] = useState(null);

  // 检查是否为游客模式
  const isGuestMode = token === 'guest-token';

  useEffect(() => {
    if (isGuestMode) {
      // 游客模式：从localStorage获取数据
      const guestPresentations = JSON.parse(localStorage.getItem('guestPresentations') || '[]');
      const presentationData = guestPresentations.find(p => p.id.toString() === id);
      if (presentationData) {
        setPresentation(presentationData);
        setAnimationsEnabled(presentationData.animationsEnabled || false);
        if (presentationData.slides.length > 0 && !presentationData.slides[0].elements) {
          presentationData.slides[0].elements = [];
        }
      } else {
        console.error('Presentation not found in guest mode');
      }
    } else {
      // 正常模式：从后端获取数据
      api.store.get()
        .then((response) => {
          const store = response.data.store || {};
          const presentationData = store[id];
          if (presentationData) {
            setPresentation(presentationData);
            setAnimationsEnabled(presentationData.animationsEnabled || false);
            if (presentationData.slides.length > 0 && !presentationData.slides[0].elements) {
              presentationData.slides[0].elements = [];
            }
          } else {
            console.error('Presentation not found');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch presentation', err);
        });
    }
  }, [id, token, isGuestMode]);

  async function updateStore(updatedPresentation) {
    if (isGuestMode) {
      // 游客模式：更新localStorage
      const guestPresentations = JSON.parse(localStorage.getItem('guestPresentations') || '[]');
      const updatedPresentations = guestPresentations.map(p => 
        p.id.toString() === id ? updatedPresentation : p
      );
      localStorage.setItem('guestPresentations', JSON.stringify(updatedPresentations));
    } else {
      // 正常模式：更新后端
      const storeResponse = await api.store.get();
      const store = storeResponse.data.store || {};
      store[id] = updatedPresentation;

      await api.store.update(store);
    }
  }

  if (!presentation) {
    return <div>Loading...</div>;
  }

  const currentSlide = presentation.slides[currentSlideIndex] || {};

  const slideStyle = {
    background: (() => {
      const bg = currentSlide.background || presentation.defaultBackground || {};
      switch (bg.type) {
        case 'solid':
          return bg.value || '#ffffff';
        case 'gradient':
          return `linear-gradient(${bg.direction || '45deg'}, ${bg.from || '#ffffff'}, ${bg.to || '#000000'})`;
        case 'image':
          return `url(${bg.url}) center/cover no-repeat`;
        default:
          return '#ffffff';
      }
    })(),
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  };

  // 渲染元素
  function renderElements() {
    return (currentSlide.elements || []).map((element) => {
      // 确保element有必要的属性
      if (!element || !element.id) {
        return null;
      }

      // 确保position、size和properties存在并有默认值
      const elementWithDefaults = {
        ...element,
        position: element.position || { x: 0, y: 0 },
        size: element.size || { width: 30, height: 20 },
        properties: element.properties || {}
      };

      const isSelected = selectedElementId === element.id;
      
      let ElementComponent;
      switch (element.type) {
        case 'text':
          ElementComponent = TextElement;
          break;
        case 'image':
          ElementComponent = ImageElement;
          break;
        case 'video':
          ElementComponent = VideoElement;
          break;
        case 'code':
          ElementComponent = CodeElement;
          break;
        default:
          return null;
      }

      return (
        <MoveAndResize
          key={element.id}
          element={elementWithDefaults}
          updateElementPositionSize={(elementId, { position, size }) => {
            const updatedSlide = {
              ...currentSlide,
              elements: (currentSlide.elements || []).map(el =>
                el.id === elementId ? { ...el, position: position, size: size } : el
              )
            };
            const updatedPresentation = {
              ...presentation,
              slides: presentation.slides.map((slide, index) =>
                index === currentSlideIndex ? updatedSlide : slide
              )
            };
            setPresentation(updatedPresentation);
            updateStore(updatedPresentation);
          }}
          onMoveOrResizeEnd={() => {
            // 保存更新到后端
            updateStore(presentation);
          }}
        >
          <div 
            onClick={() => setSelectedElementId(element.id)}
            style={{ 
              width: '100%', 
              height: '100%',
              cursor: isSelected ? 'move' : 'pointer'
            }}
          >
            <ElementComponent element={elementWithDefaults} />
          </div>
        </MoveAndResize>
      );
    });
  }

  // 处理幻灯片切换
  function handleSlideChange(index) {
    setCurrentSlideIndex(index);
    setSelectedElementId(null);
  }

  // 拖动排序功能
  function handleDragStart(e, index) {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  }

  function handleDragEnd() {
    setDraggedIndex(null);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
  }

  function handleDrop(e, dropIndex) {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (dragIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newSlides = [...presentation.slides];
    const draggedSlide = newSlides[dragIndex];
    
    // 移除被拖动的幻灯片
    newSlides.splice(dragIndex, 1);
    // 在新位置插入
    newSlides.splice(dropIndex, 0, draggedSlide);

    const updatedPresentation = {
      ...presentation,
      slides: newSlides
    };

    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);

    // 更新当前选中的幻灯片索引
    if (currentSlideIndex === dragIndex) {
      setCurrentSlideIndex(dropIndex);
    } else if (dragIndex < currentSlideIndex && dropIndex >= currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    } else if (dragIndex > currentSlideIndex && dropIndex <= currentSlideIndex) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }

    setDraggedIndex(null);
  }

  // 添加幻灯片
  function handleAddSlide() {
    const newSlide = {
      id: uuidv4(),
      elements: []
    };
    const updatedPresentation = {
      ...presentation,
      slides: [...presentation.slides, newSlide]
    };
    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
    setCurrentSlideIndex(presentation.slides.length);
  }

  // 删除幻灯片
  function handleDeleteSlide() {
    if (presentation.slides.length <= 1) {
      setNotificationOpen(true);
      return;
    }
    
    const updatedSlides = presentation.slides.filter((_, index) => index !== currentSlideIndex);
    const updatedPresentation = {
      ...presentation,
      slides: updatedSlides
    };
    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
    
    if (currentSlideIndex >= updatedSlides.length) {
      setCurrentSlideIndex(updatedSlides.length - 1);
    }
  }

  // 添加元素
  function handleAddElement(type) {
    setModalType(type);
    setEditingElementId(null);
    setElementProperties({});
    setShowModal(true);
  }

  // 保存元素
  function handleSaveElement() {
    const newElement = {
      id: uuidv4(),
      type: modalType,
      position: { x: 10, y: 10 },
      size: { width: 30, height: 20 },
      properties: { ...elementProperties }
    };

    const updatedSlide = {
      ...currentSlide,
      elements: [...(currentSlide.elements || []), newElement]
    };
    
    const updatedPresentation = {
      ...presentation,
      slides: presentation.slides.map((slide, index) =>
        index === currentSlideIndex ? updatedSlide : slide
      )
    };

    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
    setShowModal(false);
  }

  // 更新元素
  function handleUpdateElement() {
    const updatedSlide = {
      ...currentSlide,
      elements: (currentSlide.elements || []).map(el =>
        el.id === editingElementId ? { 
          ...el, 
          properties: { ...el.properties, ...elementProperties }
        } : el
      )
    };
    
    const updatedPresentation = {
      ...presentation,
      slides: presentation.slides.map((slide, index) =>
        index === currentSlideIndex ? updatedSlide : slide
      )
    };

    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
    setShowModal(false);
  }

  // 设置背景
  function handleSetBackground(backgroundConfig) {
    if (isDefaultBackground) {
      const updatedPresentation = {
        ...presentation,
        defaultBackground: backgroundConfig
      };
      setPresentation(updatedPresentation);
      updateStore(updatedPresentation);
    } else {
      const updatedSlide = {
        ...currentSlide,
        background: backgroundConfig
      };
      const updatedPresentation = {
        ...presentation,
        slides: presentation.slides.map((slide, index) =>
          index === currentSlideIndex ? updatedSlide : slide
        )
      };
      setPresentation(updatedPresentation);
      updateStore(updatedPresentation);
    }
    setShowBackgroundModal(false);
  }

  // 切换动画
  function toggleAnimations() {
    const newAnimationsEnabled = !animationsEnabled;
    setAnimationsEnabled(newAnimationsEnabled);
    const updatedPresentation = {
      ...presentation,
      animationsEnabled: newAnimationsEnabled
    };
    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
  }

  // 删除演示文稿
  function handleDeletePresentation() {
    setIsConfirmModalOpen(true);
  }

  function handleConfirmDelete() {
    if (isGuestMode) {
      // 游客模式：从localStorage删除
      const guestPresentations = JSON.parse(localStorage.getItem('guestPresentations') || '[]');
      const updatedPresentations = guestPresentations.filter(p => p.id.toString() !== id);
      localStorage.setItem('guestPresentations', JSON.stringify(updatedPresentations));
      navigate('/dashboard');
    } else {
      // 正常模式：从后端删除
      api.store.get()
        .then((response) => {
          const store = response.data.store || {};
          delete store[id];
          return api.store.update(store);
        })
        .then(() => {
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error('Failed to delete presentation', err);
        });
    }
  }

  function handleCancelDelete() {
    setIsConfirmModalOpen(false);
  }

  // 更新标题
  function handleUpdateTitle() {
    const updatedPresentation = {
      ...presentation,
      name: newTitle
    };
    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
    setShowTitleModal(false);
  }

  // 更新描述
  function handleUpdateDescription() {
    const updatedPresentation = {
      ...presentation,
      description: newDescription
    };
    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
    setShowDescriptionModal(false);
  }



  // 预览
  function handlePreview() {
    window.open(`/preview/${presentation.id}/${currentSlideIndex}`, '_blank');
  }

  // 处理图片文件变更
  function handleImageFileChange(file) {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setElementProperties(prev => ({
          ...prev,
          src: e.target.result,
          alt: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="presentation-container-new">
      {/* 顶部工具栏 */}
      <div className="presentation-header">
        <h1 className="presentation-title">{presentation.name}</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            返回Dashboard
          </button>
          <button className="btn btn-primary" onClick={handlePreview}>
            预览演示
          </button>
          <button className="btn btn-danger" onClick={handleDeletePresentation}>
            删除演示文稿
          </button>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="presentation-main">
        {/* 左侧缩略图滚动区域 */}
        <div className="thumbnails-sidebar">
          <div className="thumbnails-header">
            <h3>幻灯片</h3>
            <button className="btn btn-sm btn-primary" onClick={handleAddSlide}>
              添加幻灯片
            </button>
          </div>
          
          <div className="thumbnails-scroll">
            {presentation.slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`thumbnail-item ${index === currentSlideIndex ? 'active' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
                onClick={() => handleSlideChange(index)}
                draggable="true"
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="thumbnail-preview">
                  <SlideThumbnail 
                    slide={{
                      ...slide,
                      background: slide.background || presentation.defaultBackground || {}
                    }}
                  />
                </div>
                <div className="thumbnail-info">
                  <div className="thumbnail-left">
                    <span className="drag-handle" title="拖动排序">⋮⋮</span>
                    <span className="slide-number">{index + 1}</span>
                  </div>
                  <button 
                    className="btn btn-xs btn-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (presentation.slides.length > 1) {
                        handleSlideChange(index);
                        setTimeout(() => handleDeleteSlide(), 100);
                      } else {
                        setNotificationOpen(true);
                      }
                    }}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 右侧编辑区域 */}
        <div className="editor-area">
          {/* 编辑工具栏 */}
          <div className="editor-toolbar">
            <div className="toolbar-section">
              <h4>添加元素</h4>
              <div className="toolbar-buttons">
                <button className="btn btn-sm" onClick={() => handleAddElement('text')}>📝 文本</button>
                <button className="btn btn-sm" onClick={() => handleAddElement('image')}>🖼️ 图片</button>
                <button className="btn btn-sm" onClick={() => handleAddElement('video')}>🎥 视频</button>
                <button className="btn btn-sm" onClick={() => handleAddElement('code')}>💻 代码</button>
              </div>
            </div>
            
            <div className="toolbar-section">
              <h4>设置</h4>
              <div className="toolbar-buttons">
                <button className="btn btn-sm" onClick={() => setShowBackgroundModal(true)}>
                  🎨 背景
                </button>
                <button 
                  className={`btn btn-sm ${animationsEnabled ? 'btn-success' : ''}`}
                  onClick={toggleAnimations}
                >
                  {animationsEnabled ? '✅ 动画' : '⭕ 动画'}
                </button>
              </div>
            </div>

            <div className="toolbar-section">
              <h4>编辑</h4>
              <div className="toolbar-buttons">
                <button className="btn btn-sm" onClick={() => setShowTitleModal(true)}>
                  编辑标题
                </button>
                <button className="btn btn-sm" onClick={() => setShowDescriptionModal(true)}>
                  编辑描述
                </button>
              </div>
            </div>
          </div>

          {/* 幻灯片编辑区 */}
          <div className="slide-editor">
            <div className="slide-container" style={slideStyle}>
              {animationsEnabled ? (
                <Animation slideKey={currentSlideIndex}>
                  {renderElements()}
                </Animation>
              ) : (
                renderElements()
              )}
              <div className="slide-number">{currentSlideIndex + 1}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 模态框 */}
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
          onRearrange={(newSlidesOrder) => {
            const updatedPresentation = { ...presentation, slides: newSlidesOrder };
            setPresentation(updatedPresentation);
            updateStore(updatedPresentation);
            setShowRearrangeModal(false);
          }}
          onClose={() => setShowRearrangeModal(false)}
        />
      )}

      {showRevisionModal && (
        <RevisionHistory
          history={presentation.history || []}
          onRestore={(entry) => {
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
          }}
          onClose={() => setShowRevisionModal(false)}
        />
      )}

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