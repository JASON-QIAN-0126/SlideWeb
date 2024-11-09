import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SlideThumbnail from './SlideThumbnail';
import styled from 'styled-components';

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
  background-color: white;
  padding: 20px;
  max-height: 80vh;
  width: 80vw;
  max-width: 400px;
  overflow-y: auto;
  box-shadow: 0px 0px 15px rgba(182, 150, 193, 0.3);
  border: 3px solid white;
  border-radius: 8px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h3`
  color: #6950a1;
  margin-bottom: 0px;
  text-align: center;
  font-size: 1.5rem;
`;

const SlidesContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  gap: 10px;
`;

const SlideItem = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 10px;
`;

const ThumbnailCard = styled.div`
  position: relative;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
  background-color: #f9f9f9;
  width: 200px;
  height: 112.5px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
    background-color: #9b95c9;
  }
`;

const SlideIndex = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  background-color: rgba(0, 0, 0, 0.7);
  color: #fff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
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

function RearrangeSlides({ slides, defaultBackground, onRearrange, onClose }) {
  const [localSlides, setLocalSlides] = useState([]);

  useEffect(() => {
    setLocalSlides(slides);
  }, [slides]);

  const handleOnDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const items = Array.from(localSlides);
    const [reorderedItem] = items.splice(source.index, 1);
    items.splice(destination.index, 0, reorderedItem);

    setLocalSlides(items);
    onRearrange(items);
  };

  return (
    <Overlay>
      <ModalContainer>
        <Title>Rearrange Slides</Title>
        <CancelButton onClick={onClose}>Close</CancelButton>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="slides" direction="vertical">
            {(provided) => (
              <SlidesContainer
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {localSlides.map((slide, index) => (
                  <Draggable key={String(slide.id)} draggableId={String(slide.id)} index={index}>
                    {(provided) => (
                      <SlideItem
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ThumbnailCard>
                          <SlideThumbnail 
                            slide={{ 
                              ...slide, 
                              background: slide.background || defaultBackground || {} 
                            }} 
                          />
                          <SlideIndex>{index + 1}</SlideIndex>
                        </ThumbnailCard>
                      </SlideItem>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </SlidesContainer>
            )}
          </Droppable>
        </DragDropContext>
      </ModalContainer>
    </Overlay>
  );
}

export default RearrangeSlides;