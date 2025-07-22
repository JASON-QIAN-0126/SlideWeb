import { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import SlideThumbnail from './SlideThumbnail';
import { API_BASE_URL } from '../config.js';
import '../styles/dashboard.css';

function Dashboard({ onLogout, token}) {
  const [presentations, setPresentations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPresentationName, setNewPresentationName] = useState('');
  const [newPresentationDescription, setNewPresentationDescription] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
            axios.get(`${API_BASE_URL}/store`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((response) => {
        const store = response.data.store || {};
        const presentationsArray = Object.values(store);
        setPresentations(presentationsArray);
      })
      .catch((err) => {
        console.error('Failed to fetch presentations', err);
      });
  }, [token]);

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
      slides: [{ id: uuidv4(), elements: [] }],
    };

    const savePresentation = () => {
      axios
        .get(`${API_BASE_URL}/store`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const store = response.data.store || {};
          store[newPresentation.id] = newPresentation;

          return axios.put(
            `${API_BASE_URL}/store`,
            {
              store: store,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
        })
        .then(() => {
          setPresentations([...presentations, newPresentation]);
          setShowModal(false);
          setNewPresentationName('');
          setNewPresentationDescription('');
          console.log('Presentation saved successfully in global store');
        })
        .catch((err) => {
          console.error('Failed to save presentation', err);
        });
    };
    savePresentation();
  }

  function handlePresentationClick(id) {
    navigate(`/presentation/${id}`);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Presto Dashboard</h1>
        <p className="dashboard-subtitle">管理您的演示文稿</p>
      </div>
      <div className="dashboard-actions">
        <button className="btn-primary" onClick={handleCreatePresentation}>创建演示文稿</button>
        <button className="btn-secondary" onClick={handleLogout}>退出登录</button>
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
            <p style={{fontSize: '0.9rem', color: '#6c757d', margin: '10px 0'}}>缩略图可以在每个演示文稿中选择（默认为第一张幻灯片）</p>
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
            <h3 className="empty-state-title">还没有演示文稿</h3>
            <p className="empty-state-description">点击上方按钮创建您的第一个演示文稿</p>
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
                        ...presentation.slides[presentation.thumbnailSlideIndex || 0], 
                        background: presentation.slides[presentation.thumbnailSlideIndex || 0]?.background || presentation.defaultBackground || {} 
                      }} 
                    />
                  ) : (
                    <SlideThumbnail />
                  )}
                </div>
                <div className="presentation-info">
                  <h3 className="presentation-title">{presentation.name}</h3>
                  <div className="presentation-meta">
                    <span className="presentation-date">
                      {new Date().toLocaleDateString('zh-CN')}
                    </span>
                    <span className="presentation-slides-count">
                      {presentation.slides.length} 张幻灯片
                    </span>
                  </div>
                  {presentation.description && (
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: '#6c757d', lineHeight: '1.4' }}>
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
  );
}

export default Dashboard;