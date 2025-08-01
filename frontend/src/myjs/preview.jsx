import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextElement from './textelement';
import ImageElement from './imageelement';
import VideoElement from './videoelement';
import CodeElement from './codeelement';
import Animation from './animation';
import SlideArrow from './modal/SlideArrow';
import { api } from '../utils/api';

function Preview({ token }) {
  const { id, slideIndex } = useParams();
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(parseInt(slideIndex) || 0);
  const navigate = useNavigate();

  // 检查是否为游客模式
  const isGuestMode = token === 'guest-token';

  useEffect(() => {
    if (isGuestMode) {
      // 游客模式：从localStorage获取数据
      const guestPresentations = JSON.parse(localStorage.getItem('guestPresentations') || '[]');
      const presentationData = guestPresentations.find(p => p.id.toString() === id);
      if (presentationData) {
        setPresentation(presentationData);
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
          } else {
            console.error('Presentation not found');
          }
        })
        .catch((err) => {
          console.error('Failed to fetch presentation', err);
        });
    }
  }, [id, token, isGuestMode]);

  const handleNextSlide = () => {
    if (currentSlideIndex < presentation.slides.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      navigate(`/preview/${id}/${newIndex}`, { replace: true });
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      navigate(`/preview/${id}/${newIndex}`, { replace: true });
    }
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
  const animationsEnabled = presentation.animationsEnabled || false;

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
          overflow: 'hidden',
        };

        let content = null;
        switch (element.type) {
        case 'text':
          content = <TextElement element={element} />;
          break;
        case 'image':
          content = <ImageElement element={element} />;
          break;
        case 'video':
          content = <VideoElement element={element} />;
          break;
        case 'code':
          content = <CodeElement element={element} />;
          break;
        default:
          break;
        }

        return (
          <div key={element.id} style={style}>
            {content}
          </div>
        );
      });
  };

  const slideBackground = currentSlide.background || presentation.defaultBackground || {};

  const slideStyle = {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#fff',
    margin: 0,
    overflow: 'hidden',
  };

  if (slideBackground.type === 'color') {
    slideStyle.backgroundColor = slideBackground.value;
  } else if (slideBackground.type === 'gradient') {
    slideStyle.backgroundImage = slideBackground.value;
  } else if (slideBackground.type === 'image') {
    slideStyle.backgroundImage = `url(${slideBackground.value})`;
    slideStyle.backgroundSize = 'cover';
  }

  return (
    <div style={slideStyle}>
      {animationsEnabled ? (
        <Animation slideKey={currentSlideIndex}>
          {renderElements()}
        </Animation>
      ) : (
        renderElements()
      )}
      {presentation.slides.length > 1 && (
        <SlideArrow
          handlePrevSlide={handlePrevSlide}
          handleNextSlide={handleNextSlide}
          currentSlideIndex={currentSlideIndex}
          totalSlides={presentation.slides.length}
        />
      )}
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '15px',
          fontSize: '0.9rem',
          fontWeight: '500',
          color: '#333333',
          zIndex: 10,
        }}
      >
        {currentSlideIndex + 1} / {presentation.slides.length}
      </div>
    </div>
  );
}

export default Preview;