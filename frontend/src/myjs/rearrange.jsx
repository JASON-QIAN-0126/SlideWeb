import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import SlideThumbnail from './SlideThumbnail';

function RearrangeSlides({ slides, onRearrange, onClose }) {
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
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          margin: '50px auto',
          padding: '20px',
          backgroundColor: '#fff',
          maxWidth: '800px',
          borderRadius: '8px',
          height: '80vh',
          overflowY: 'auto', // 保留滚动
        }}
      >
        <h2>Rearrange Slides</h2>
        <button onClick={onClose} style={{ marginRight: '10px' }}>Close</button>
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="slides" direction="horizontal">
            {(provided) => (
              <div
                className="slides-container"
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  display: 'flex',
                  padding: '10px',
                  marginTop: '20px',
                }}
              >
                {localSlides.map((slide, index) => (
                  <Draggable
                    key={String(slide.id)}
                    draggableId={String(slide.id)}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        className="slide-item"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          margin: '0 10px',
                          ...provided.draggableProps.style,
                        }}
                      >
                        <div
                          style={{
                            position: 'relative',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '5px',
                            backgroundColor: '#f9f9f9',
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <SlideThumbnail slide={slide} />
                          <div
                            style={{
                              position: 'absolute',
                              top: '5px',
                              left: '5px',
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              color: '#fff',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default RearrangeSlides;