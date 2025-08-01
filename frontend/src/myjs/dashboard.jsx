import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { preloadManager } from './preloadManager';
import '../styles/dashboard.css';

// 使用预加载的模块
const SlideThumbnail = preloadManager.getPreloadedModule('SlideThumbnail')?.default || 
  (() => import('./SlideThumbnail').then(m => m.default));
const Particles = preloadManager.getPreloadedModule('Particles')?.default || 
  (() => import('../components/Particles/Particles').then(m => m.default));
const api = preloadManager.getPreloadedModule('api')?.api || 
  (() => import('../utils/api').then(m => m.api));
const createExamplePresentation = preloadManager.getPreloadedModule('examplePresentation')?.createExamplePresentation || 
  (() => import('./examplePresentation').then(m => m.createExamplePresentation));

// Particles包装组件，处理异步加载
function ParticlesWrapper() {
  const [ParticlesComponent, setParticlesComponent] = useState(null);

  useEffect(() => {
    const loadParticles = async () => {
      try {
        const ParticlesModule = await Particles;
        setParticlesComponent(() => ParticlesModule);
      } catch (error) {
        console.error('Failed to load Particles component:', error);
      }
    };

    loadParticles();
  }, []);

  if (!ParticlesComponent) {
    return null; // 或者返回一个加载指示器
  }

  return <ParticlesComponent />;
}

// SlideThumbnail包装组件，处理异步加载
function SlideThumbnailWrapper({ slide }) {
  const [SlideThumbnailComponent, setSlideThumbnailComponent] = useState(null);

  useEffect(() => {
    const loadSlideThumbnail = async () => {
      try {
        const SlideThumbnailModule = await SlideThumbnail;
        setSlideThumbnailComponent(() => SlideThumbnailModule);
      } catch (error) {
        console.error('Failed to load SlideThumbnail component:', error);
      }
    };

    loadSlideThumbnail();
  }, []);

  if (!SlideThumbnailComponent) {
    return <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#666' }}>加载中...</span>
    </div>;
  }

  return slide ? <SlideThumbnailComponent slide={slide} /> : <SlideThumbnailComponent />;
}

function Dashboard({ onLogout, token}) {
  const [presentations, setPresentations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState('');
  const [newPresentationDescription, setNewPresentationDescription] = useState('');
  const [userInfo, setUserInfo] = useState({ name: '用户' });
  const navigate = useNavigate();

  // 检查是否为游客模式
  const isGuestMode = token === 'guest-token';



  useEffect(() => {
    const loadData = async () => {
      if (isGuestMode) {
        // 游客模式：从localStorage获取数据
        let guestPresentations = JSON.parse(localStorage.getItem('guestPresentations') || '[]');
        
        // 如果是首次访问（没有演示文稿），创建示例演示文稿
        if (guestPresentations.length === 0) {
          try {
            const createExampleFn = await createExamplePresentation;
            const examplePresentation = createExampleFn();
            guestPresentations = [examplePresentation];
            localStorage.setItem('guestPresentations', JSON.stringify(guestPresentations));
          } catch (error) {
            console.error('Failed to create example presentation:', error);
          }
        }
        
        setPresentations(guestPresentations);
        setUserInfo({ name: '游客' });
      } else {
        // 正常模式：从后端获取数据
        try {
          const apiInstance = await api;
          const response = await apiInstance.store.get();
          const store = response.data.store || {};
          const presentationsArray = Object.values(store);
          setPresentations(presentationsArray);
        } catch (err) {
          console.error('Failed to fetch presentations', err);
        }

        // 获取用户信息
        try {
          const apiInstance = await api;
          const response = await apiInstance.auth.getProfile();
          if (response.data && response.data.name) {
            setUserInfo({ name: response.data.name });
          }
        } catch (err) {
          console.error('Failed to fetch user info', err);
          // 如果获取用户信息失败，尝试从token中解析（简单实现）
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.email) {
              setUserInfo({ name: payload.email.split('@')[0] });
            }
          } catch (e) {
            console.log('Could not parse token');
          }
        }
      }
    };

    loadData();
  }, [token, isGuestMode]);

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
    if (!newPresentationName.trim()) {
      alert('请输入演示文稿名称');
      return;
    }

    const newPresentation = {
      id: Date.now(),
      name: newPresentationName,
      description: newPresentationDescription,
      thumbnailSlideIndex: 0,
      slides: [{
        id: uuidv4(),
        elements: []
      }],
      defaultBackground: { type: 'solid', value: '#ffffff' }
    };

    if (isGuestMode) {
      // 游客模式：保存到localStorage
      const updatedPresentations = [...presentations, newPresentation];
      setPresentations(updatedPresentations);
      localStorage.setItem('guestPresentations', JSON.stringify(updatedPresentations));
      setShowModal(false);
      setNewPresentationName('');
      setNewPresentationDescription('');
      console.log('Presentation saved successfully in guest mode');
    } else {
      // 正常模式：保存到后端
      const savePresentation = async () => {
        try {
          const apiInstance = await api;
          const storeResponse = await apiInstance.store.get();
          const currentStore = storeResponse.data.store || {};
          currentStore[newPresentation.id] = newPresentation;

          await apiInstance.store.update(currentStore);

          setPresentations([...presentations, newPresentation]);
          setShowModal(false);
          setNewPresentationName('');
          setNewPresentationDescription('');
          console.log('Presentation saved successfully in global store');
        } catch (err) {
          console.error('Failed to save presentation', err);
        }
      };
      
      savePresentation();
    }
  }

  function handlePresentationClick(id) {
    navigate(`/presentation/${id}`);
  }

  return (
    <div className="dashboard-container" style={{ background: '#0d1117', position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <ParticlesWrapper />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div className="dashboard-header">
          <h1 className="dashboard-title" style={{ color: 'white' }}>
            Welcome {userInfo.name}!
            {isGuestMode && <span style={{ fontSize: '0.8rem', color: '#a0aec0', marginLeft: '10px' }}>(游客模式)</span>}
          </h1>
          <p className="dashboard-subtitle" style={{ color: '#e2e8f0' }}>
            {isGuestMode ? '游客模式 - 数据仅保存在本地' : '管理您的演示文稿'}
          </p>
        </div>
        
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleCreatePresentation}>创建演示文稿</button>
          <button className="btn-outline btn-secondary" onClick={handleLogout}>
            {isGuestMode ? '退出游客模式' : '退出登录'}
          </button>
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 className="modal-title">创建新演示文稿</h3>
              <input
                type="text"
                value={newPresentationName}
                onChange={(e) => setNewPresentationName(e.target.value)}
                placeholder="演示文稿名称"
                className="modal-input"
              />
              <input
                type="text"
                value={newPresentationDescription}
                onChange={(e) => setNewPresentationDescription(e.target.value)}
                placeholder="描述（可选）"
                className="modal-input"
              />
              {isGuestMode && (
                <p style={{fontSize: '0.8rem', color: '#e53e3e', margin: '5px 0'}}>
                  ⚠️ 游客模式：数据仅保存在本地浏览器中
                </p>
              )}
              <div className="modal-actions">
                <button className="btn-modal-secondary" onClick={handleCancel}>取消</button>
                <button className="btn-modal-primary" onClick={handleSavePresentation}>创建</button>
              </div>
            </div>
          </div>
        )}

        <div className="presentations-section">
          {presentations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <h3 className="empty-state-title" style={{ color: 'white' }}>还没有演示文稿</h3>
              <p className="empty-state-description" style={{ color: '#e2e8f0' }}>点击上方按钮创建您的第一个演示文稿</p>
            </div>
          ) : (
            <div className="presentations-grid">
              {presentations.map((presentation) => (
                <div
                  key={presentation.id}
                  className="presentation-card"
                  onClick={() => handlePresentationClick(presentation.id)}
                >
                  <div className="presentation-thumbnail">
                    {presentation.slides && presentation.slides.length > 0 ? (
                      <SlideThumbnailWrapper 
                        slide={{ 
                          ...presentation.slides[0], 
                          background: presentation.slides[0]?.background || presentation.defaultBackground || {} 
                        }} 
                      />
                    ) : (
                      <SlideThumbnailWrapper />
                    )}
                  </div>
                  <div className="presentation-info">
                    <div className="presentation-left">
                      <h3 className="presentation-title">{presentation.name}</h3>
                      {presentation.description && (
                        <p className="presentation-description">{presentation.description}</p>
                      )}
                    </div>
                    <div className="presentation-right">
                      <div className="presentation-slides-count">{presentation.slides.length} 张幻灯片</div>
                      <div className="presentation-date">{new Date().toLocaleDateString('zh-CN')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;