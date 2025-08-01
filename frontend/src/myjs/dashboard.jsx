import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import SlideThumbnail from './SlideThumbnail';
import LightRays from '../components/LightRays/LightRays';
import { api } from '../utils/api.js';
import '../styles/dashboard.css';

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
    if (isGuestMode) {
      // 游客模式：从localStorage获取数据
      const guestPresentations = JSON.parse(localStorage.getItem('guestPresentations') || '[]');
      setPresentations(guestPresentations);
      setUserInfo({ name: '游客' });
    } else {
      // 正常模式：从后端获取数据
      api.store.get()
        .then((response) => {
          const store = response.data.store || {};
          const presentationsArray = Object.values(store);
          setPresentations(presentationsArray);
        })
        .catch((err) => {
          console.error('Failed to fetch presentations', err);
        });

      // 获取用户信息
      api.auth.getProfile()
        .then((response) => {
          if (response.data && response.data.name) {
            setUserInfo({ name: response.data.name });
          }
        })
        .catch((err) => {
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
        });
    }
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
          const storeResponse = await api.store.get();
          const currentStore = storeResponse.data.store || {};
          currentStore[newPresentation.id] = newPresentation;

          await api.store.update(currentStore);

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
    <div className="dashboard-container" style={{ background: '#4a4a4a', position: 'relative', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <LightRays 
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.5}
          lightSpread={1.2}
          rayLength={1.5}
          fadeDistance={0.8}
          saturation={0.3}
          followMouse={true}
          mouseInfluence={0.05}
        />
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
          <button className="btn-primary" onClick={handleCreatePresentation}>创建演示文稿</button>
          <button className="btn-secondary" onClick={handleLogout}>
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
                placeholder="描述"
                className="modal-input"
              />
              <p style={{fontSize: '0.9rem', color: '#6c757d', margin: '10px 0'}}>缩略图将显示演示文稿的所有幻灯片</p>
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
                      <SlideThumbnail 
                        slide={{ 
                          ...presentation.slides[0], 
                          background: presentation.slides[0]?.background || presentation.defaultBackground || {} 
                        }} 
                      />
                    ) : (
                      <SlideThumbnail />
                    )}
                  </div>
                  <div className="presentation-info">
                    <h3 className="presentation-title" style={{ color: 'white' }}>{presentation.name}</h3>
                    <div className="presentation-meta">
                      <span className="presentation-date" style={{ color: '#cbd5e0' }}>
                        {new Date().toLocaleDateString('zh-CN')}
                      </span>
                      <span className="presentation-slides-count" style={{ color: '#cbd5e0' }}>
                        {presentation.slides.length} 张幻灯片
                      </span>
                    </div>
                    {presentation.description && (
                      <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#e2e8f0', lineHeight: '1.4' }}>
                        {presentation.description}
                      </p>
                    )}
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