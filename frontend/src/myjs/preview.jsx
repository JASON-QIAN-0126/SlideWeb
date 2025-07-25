import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import TextElement from './textelement';
import ImageElement from './imageelement';
import VideoElement from './videoelement';
import CodeElement from './codeelement';
import Animation from './animation';
import SlideArrow from './modal/SlideArrow';

function Preview({ token }) {
  const { id, slideIndex } = useParams();
  const [presentation, setPresentation] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(parseInt(slideIndex) || 0);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [id, token]);

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
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '1em',
        }}
      >
        {currentSlideIndex + 1} / {presentation.slides.length}
      </div>
    </div>
  );
}

export default Preview;