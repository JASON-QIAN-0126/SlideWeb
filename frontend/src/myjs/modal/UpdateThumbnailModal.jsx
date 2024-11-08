import React from 'react';
import styled from 'styled-components';
import SlideThumbnail from '../SlideThumbnail';

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  padding: 20px;
  max-height: 80vh;
  width: 80vw;
  overflow-y: auto;
  box-shadow: 0px 0px 15px rgba(255, 182, 193, 0.4);
  border: 3px solid #ffc0cb;
  border-radius: 8px;
  z-index: 1000;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ThumbnailCard = styled.div`
  cursor: pointer;
  border: ${({ selected }) => (selected ? '2px solid blue' : '1px solid #ccc')};
  padding: 10px;
  border-radius: 4px;
  background-color: ${({ selected }) => (selected ? '#e0f7fa' : '#fff')};
  text-align: center;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  color: #fff;
  background-color: #ff69b4;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease, transform 0.1s ease;

  &:hover {
    background-color: #ff85c2;
  }

  &:active {
    background-color: #ff4da6;
    transform: scale(0.98);
  }
`;

function ThumbnailModal({ presentation, thumbnailSlideIndex, handleUpdateThumbnail, onClose }) {
  return (
    <ModalContainer>
      <h3>Select Thumbnail Slide</h3>
      <ThumbnailGrid>
        {presentation.slides.map((slide, index) => (
          <ThumbnailCard
            key={slide.id}
            selected={index === thumbnailSlideIndex}
            onClick={() => { handleUpdateThumbnail(index); onClose(); }}
          >
            <p>Slide {index + 1}</p>
            <SlideThumbnail 
              slide={{ 
                ...slide, 
                background: slide.background || presentation.defaultBackground || {} 
              }} 
            />
          </ThumbnailCard>
        ))}
      </ThumbnailGrid>
      <CancelButton onClick={onClose}>Cancel</CancelButton>
    </ModalContainer>
  );
}

export default ThumbnailModal;