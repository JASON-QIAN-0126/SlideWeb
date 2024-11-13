import { useState, useEffect, useRef, useCallback } from 'react';

function MoveAndResize({ element, updateElementPositionSize, onMoveOrResizeEnd, children }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

  // Refs to hold latest state
  const isDraggingRef = useRef(isDragging);
  const isResizingRef = useRef(isResizing);
  const resizeDirectionRef = useRef(resizeDirection);
  const startXRef = useRef(startX);
  const startYRef = useRef(startY);
  const originalPositionRef = useRef(originalPosition);
  const originalSizeRef = useRef(originalSize);

  // Update refs whenever state changes
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);
  useEffect(() => { isResizingRef.current = isResizing; }, [isResizing]);
  useEffect(() => { resizeDirectionRef.current = resizeDirection; }, [resizeDirection]);
  useEffect(() => { startXRef.current = startX; }, [startX]);
  useEffect(() => { startYRef.current = startY; }, [startY]);
  useEffect(() => { originalPositionRef.current = originalPosition; }, [originalPosition]);
  useEffect(() => { originalSizeRef.current = originalSize; }, [originalSize]);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setOriginalPosition({ ...element.position });
    setOriginalSize({ ...element.size });
  };

  const handleResizeMouseDown = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setOriginalPosition({ ...element.position });
    setOriginalSize({ ...element.size });
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

  const handleMouseMove = useCallback((e) => {
    const slideWidth = 600;
    const slideHeight = 400;

    if (isDraggingRef.current) {
      const deltaX = ((e.clientX - startXRef.current) / slideWidth) * 100;
      const deltaY = ((e.clientY - startYRef.current) / slideHeight) * 100;

      let newX = originalPositionRef.current.x + deltaX;
      let newY = originalPositionRef.current.y + deltaY;

      newX = clamp(newX, 0, 100 - originalSizeRef.current.width);
      newY = clamp(newY, 0, 100 - originalSizeRef.current.height);

      updateElementPositionSize(element.id, {
        position: { x: newX, y: newY },
        size: element.size,
      });
    }

    if (isResizingRef.current) {
      const deltaX = ((e.clientX - startXRef.current) / slideWidth) * 100;

      let newWidth = originalSizeRef.current.width;
      let newHeight = originalSizeRef.current.height;
      let newX = originalPositionRef.current.x;
      let newY = originalPositionRef.current.y;

      const aspectRatio = originalSizeRef.current.width / originalSizeRef.current.height;

      if (resizeDirectionRef.current === 'nw') {
        newWidth = clamp(originalSizeRef.current.width - deltaX, 1, originalSizeRef.current.width + originalPositionRef.current.x);
        newHeight = newWidth / aspectRatio;
        newX = clamp(originalPositionRef.current.x + (originalSizeRef.current.width - newWidth), 0, 100 - newWidth);
        newY = clamp(originalPositionRef.current.y + (originalSizeRef.current.height - newHeight), 0, 100 - newHeight);
      } else if (resizeDirectionRef.current === 'ne') {
        newWidth = clamp(originalSizeRef.current.width + deltaX, 1, 100 - originalPositionRef.current.x);
        newHeight = newWidth / aspectRatio;
        newY = clamp(originalPositionRef.current.y + (originalSizeRef.current.height - newHeight), 0, 100 - newHeight);
      } else if (resizeDirectionRef.current === 'sw') {
        newWidth = clamp(originalSizeRef.current.width - deltaX, 1, originalSizeRef.current.width + originalPositionRef.current.x);
        newHeight = newWidth / aspectRatio;
        newX = clamp(originalPositionRef.current.x + (originalSizeRef.current.width - newWidth), 0, 100 - newWidth);
      } else if (resizeDirectionRef.current === 'se') {
        newWidth = clamp(originalSizeRef.current.width + deltaX, 1, 100 - originalPositionRef.current.x);
        newHeight = newWidth / aspectRatio;
      }

      newWidth = clamp(newWidth, 1, 100 - newX);
      newHeight = clamp(newHeight, 1, 100 - newY);

      updateElementPositionSize(element.id, {
        position: { x: newX, y: newY },
        size: { width: newWidth, height: newHeight },
      });
    }
  }, [element.id, element.size, updateElementPositionSize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
    if (onMoveOrResizeEnd) {
      onMoveOrResizeEnd();
    }
  }, [onMoveOrResizeEnd]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      style={{
        position: 'absolute',
        top: `${element.position.y}%`,
        left: `${element.position.x}%`,
        width: `${element.size.width}%`,
        height: `${element.size.height}%`,
        border: '1px solid blue',
        overflow: 'hidden',
        cursor: isDragging ? 'move' : 'pointer',
      }}
      onMouseDown={handleMouseDown}
    >
      {children}
      <div
        style={{
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          border: '1px solid black',
          cursor: 'nw-resize',
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
      ></div>
      <div
        style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          border: '1px solid black',
          cursor: 'ne-resize',
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: '-5px',
          left: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          border: '1px solid black',
          cursor: 'sw-resize',
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
      ></div>
      <div
        style={{
          position: 'absolute',
          bottom: '-5px',
          right: '-5px',
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          border: '1px solid black',
          cursor: 'se-resize',
        }}
        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
      ></div>
    </div>
  );
}

export default MoveAndResize;