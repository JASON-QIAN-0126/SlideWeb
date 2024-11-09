import React from 'react';
import styled from 'styled-components';
import SlideThumbnail from '../SlideThumbnail';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  max-height: 80vh;
  width: 80vw;
  overflow-y: auto;
  box-shadow: 0px 0px 15px rgba(182, 150, 193, 0.3);
  border: 3px solid white;
  border-radius: 8px;
  z-index: 1000;
`;

const Title = styled.h3`
  color: #6950a1;
  margin-bottom: 10px;
  text-align: center;
  font-size: 1.5rem;
`;

const ThumbnailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ThumbnailCard = styled.div`
  cursor: pointer;
  border: ${({ selected }) => (selected ? '2px solid #9c81b5' : '1px solid #ccc')};
  padding: 10px;
  border-radius: 4px;
  background-color: ${({ selected }) => (selected ? '#e8dff0' : '#fff')};
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background-color: #f1e8f6;
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  background-color: white;
  color: #6950a1;
  border: 1px solid #6950a1;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #ddd;
    transform: scale(1.05);
  }
`;

function ThumbnailModal({ presentation, thumbnailSlideIndex, handleUpdateThumbnail, onClose }) {
  return (
    <Overlay>
      <ModalContainer>
        <Title>Select Thumbnail Slide</Title>
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
    </Overlay>
  );
}

export default ThumbnailModal;