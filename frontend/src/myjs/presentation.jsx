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

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElementId) {
        handleDeleteElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementId]);

  // 删除选中元素
  function handleDeleteElement() {
    if (!selectedElementId) return;

    const updatedSlide = {
      ...presentation.slides[currentSlideIndex],
      elements: presentation.slides[currentSlideIndex].elements.filter(el => el.id !== selectedElementId)
    };
    
    const updatedPresentation = {
      ...presentation,
      slides: presentation.slides.map((slide, index) =>
        index === currentSlideIndex ? updatedSlide : slide
      )
    };

    setPresentation(updatedPresentation);
    updateStore(updatedPresentation);
    setSelectedElementId(null);
  }

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
    return (currentSlide.elements || [])
      .sort((a, b) => (a.layer || 0) - (b.layer || 0)) // 按层级排序
      .map((element) => {
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
    // 根据元素类型设置默认尺寸
    let defaultSize = { width: 30, height: 20 };
    
    if (modalType === 'text') {
      const textLength = elementProperties.text?.length || 0;
      defaultSize = {
        width: Math.min(Math.max(textLength * 0.8, 15), 60),
        height: Math.min(Math.max(textLength / 20, 8), 30)
      };
    } else if (modalType === 'image') {
      defaultSize = { width: 40, height: 30 };
    } else if (modalType === 'video') {
      defaultSize = { width: 50, height: 35 };
    } else if (modalType === 'code') {
      const codeLines = elementProperties.code?.split('\n').length || 1;
      defaultSize = {
        width: 60,
        height: Math.min(Math.max(codeLines * 2, 15), 50)
      };
    }

    const newElement = {
      id: uuidv4(),
      type: modalType,
      position: { x: 35, y: 40 }, // 页面中央位置
      size: defaultSize,
      layer: Math.max(...(currentSlide.elements || []).map(el => el.layer || 0), 0) + 1, // 默认最顶层
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
  function handleImageFileChange(event) {
    const file = event.target.files[0];
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

  // 处理视频文件变更
  function handleVideoFileChange(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setElementProperties(prev => ({
          ...prev,
          videoUrl: e.target.result,
          fileName: file.name
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  // 获取选中的元素
  function getSelectedElement() {
    const currentSlide = presentation.slides[currentSlideIndex];
    return currentSlide.elements?.find(el => el.id === selectedElementId);
  }

  // 更新元素属性
  function updateElementProperty(property, value) {
    const updatedSlide = {
      ...presentation.slides[currentSlideIndex],
      elements: presentation.slides[currentSlideIndex].elements.map(el =>
        el.id === selectedElementId 
          ? { 
              ...el, 
              properties: { 
                ...el.properties, 
                [property]: value 
              }
            } 
          : el
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
  }

  // 更新元素层级
  function updateElementLayer(newLayer) {
    const updatedSlide = {
      ...presentation.slides[currentSlideIndex],
      elements: presentation.slides[currentSlideIndex].elements.map(el =>
        el.id === selectedElementId 
          ? { 
              ...el, 
              layer: newLayer
            } 
          : el
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
  }

  // 渲染元素控制面板
  function renderElementControls() {
    const element = getSelectedElement();
    if (!element) return null;

    const props = element.properties || {};
    const currentSlide = presentation.slides[currentSlideIndex];
    const maxLayer = Math.max(...(currentSlide.elements || []).map(el => el.layer || 0), 0);

    if (element.type === 'text') {
      return (
        <div className="control-grid">
          <div className="control-group">
            <label>字体大小:</label>
            <input
              type="number"
              min="0.5"
              max="5"
              step="0.1"
              value={props.fontSize || 1}
              onChange={(e) => updateElementProperty('fontSize', parseFloat(e.target.value))}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label>颜色:</label>
            <input
              type="color"
              value={props.color || '#000000'}
              onChange={(e) => updateElementProperty('color', e.target.value)}
              className="control-input color-input"
            />
          </div>
          <div className="control-group">
            <label>字体:</label>
            <select
              value={props.fontFamily || 'Arial'}
              onChange={(e) => updateElementProperty('fontFamily', e.target.value)}
              className="control-select"
            >
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="微软雅黑">微软雅黑</option>
              <option value="宋体">宋体</option>
            </select>
          </div>
          <div className="control-group">
            <label>对齐:</label>
            <div className="alignment-buttons">
              <button 
                className={`btn btn-xs ${props.textAlign === 'left' ? 'btn-primary' : ''}`}
                onClick={() => updateElementProperty('textAlign', 'left')}
              >
                ⬅️
              </button>
              <button 
                className={`btn btn-xs ${props.textAlign === 'center' ? 'btn-primary' : ''}`}
                onClick={() => updateElementProperty('textAlign', 'center')}
              >
                ⬆️
              </button>
              <button 
                className={`btn btn-xs ${props.textAlign === 'right' ? 'btn-primary' : ''}`}
                onClick={() => updateElementProperty('textAlign', 'right')}
              >
                ➡️
              </button>
            </div>
          </div>
          <div className="control-group">
            <label>字重:</label>
            <select
              value={props.fontWeight || 'normal'}
              onChange={(e) => updateElementProperty('fontWeight', e.target.value)}
              className="control-select"
            >
              <option value="normal">正常</option>
              <option value="bold">粗体</option>
              <option value="lighter">细体</option>
            </select>
          </div>
          <div className="control-group">
            <label>层级:</label>
            <select
              value={element.layer || 0}
              onChange={(e) => updateElementLayer(parseInt(e.target.value))}
              className="control-select"
            >
              {Array.from({ length: maxLayer + 2 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? '最底层' : i === maxLayer + 1 ? '最顶层' : `第${i}层`}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (element.type === 'image') {
      return (
        <div className="control-grid">
          <div className="control-group">
            <label>图片URL:</label>
            <input
              type="text"
              value={props.src || ''}
              onChange={(e) => updateElementProperty('src', e.target.value)}
              className="control-input"
              placeholder="输入图片URL"
            />
          </div>
          <div className="control-group">
            <label>Alt文本:</label>
            <input
              type="text"
              value={props.alt || ''}
              onChange={(e) => updateElementProperty('alt', e.target.value)}
              className="control-input"
              placeholder="图片描述"
            />
          </div>
          <div className="control-group">
            <label>对象适应:</label>
            <select
              value={props.objectFit || 'cover'}
              onChange={(e) => updateElementProperty('objectFit', e.target.value)}
              className="control-select"
            >
              <option value="cover">覆盖</option>
              <option value="contain">包含</option>
              <option value="fill">填充</option>
            </select>
          </div>
          <div className="control-group">
            <label>层级:</label>
            <select
              value={element.layer || 0}
              onChange={(e) => updateElementLayer(parseInt(e.target.value))}
              className="control-select"
            >
              {Array.from({ length: maxLayer + 2 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? '最底层' : i === maxLayer + 1 ? '最顶层' : `第${i}层`}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (element.type === 'video') {
      return (
        <div className="control-grid">
          <div className="control-group">
            <label>视频URL:</label>
            <input
              type="text"
              value={props.videoUrl || ''}
              onChange={(e) => updateElementProperty('videoUrl', e.target.value)}
              className="control-input"
              placeholder="输入视频URL"
            />
          </div>
          <div className="control-group">
            <label>自动播放:</label>
            <input
              type="checkbox"
              checked={props.autoplay || false}
              onChange={(e) => updateElementProperty('autoplay', e.target.checked)}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label>循环播放:</label>
            <input
              type="checkbox"
              checked={props.loop || false}
              onChange={(e) => updateElementProperty('loop', e.target.checked)}
              className="control-input"
            />
          </div>
          <div className="control-group">
            <label>层级:</label>
            <select
              value={element.layer || 0}
              onChange={(e) => updateElementLayer(parseInt(e.target.value))}
              className="control-select"
            >
              {Array.from({ length: maxLayer + 2 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? '最底层' : i === maxLayer + 1 ? '最顶层' : `第${i}层`}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    return (
      <div className="control-grid">
        <p>选中元素: {element.type}</p>
        <div className="control-group">
          <label>层级:</label>
          <select
            value={element.layer || 0}
            onChange={(e) => updateElementLayer(parseInt(e.target.value))}
            className="control-select"
          >
            {Array.from({ length: maxLayer + 2 }, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? '最底层' : i === maxLayer + 1 ? '最顶层' : `第${i}层`}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="presentation-container-new">
      {/* 顶部工具栏 */}
      <div className="presentation-header">
        <div className="presentation-info">
          <h1 
            className="presentation-title editable-title"
            onDoubleClick={() => {
              setNewTitle(presentation.name);
              setShowTitleModal(true);
            }}
          >
            {presentation.name}
          </h1>
          <p 
            className="presentation-description editable-description"
            onDoubleClick={() => {
              setNewDescription(presentation.description || '');
              setShowDescriptionModal(true);
            }}
          >
            {presentation.description || '双击添加描述'}
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            返回Dashboard
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
                <div className="thumbnail-page-number">{index + 1}</div>
              </div>
            ))}
          </div>
          
          {/* 预览按钮 */}
          <div className="sidebar-actions">
            <button className="btn btn-primary preview-btn" onClick={handlePreview}>
              🎬 预览演示
            </button>
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

            {selectedElementId && (
              <div className="toolbar-section">
                <h4>编辑元素</h4>
                <div className="element-controls">
                  {renderElementControls()}
                </div>
              </div>
            )}


          </div>

          {/* 幻灯片编辑区 */}
          <div className="slide-editor">
            <div 
              className="slide-container" 
              style={slideStyle}
              onClick={(e) => {
                // 点击空白区域取消选择
                if (e.target === e.currentTarget) {
                  setSelectedElementId(null);
                }
              }}
            >
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
        handleVideoFileChange={handleVideoFileChange}
      />
    </div>
  );
}

export default Presentation;