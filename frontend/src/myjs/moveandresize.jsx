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
    if (e.button !== 0) return; // 只响应左键
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

  const handleMouseMove = useCallback((e) => {
    if (isDraggingRef.current) {
      const deltaX = ((e.clientX - startXRef.current) / 600) * 100; // 600为幻灯片宽度
      const deltaY = ((e.clientY - startYRef.current) / 400) * 100; // 400为幻灯片高度

      let newX = originalPositionRef.current.x + deltaX;
      let newY = originalPositionRef.current.y + deltaY;

      // 限制在幻灯片范围内
      newX = Math.max(0, Math.min(newX, 100 - element.size.width));
      newY = Math.max(0, Math.min(newY, 100 - element.size.height));

      updateElementPositionSize(element.id, {
        position: { x: newX, y: newY },
        size: element.size,
      });
    }

    if (isResizingRef.current) {
      const deltaX = ((e.clientX - startXRef.current) / 600) * 100; // 600为幻灯片宽度

      let aspectRatio = originalSizeRef.current.width / originalSizeRef.current.height;
      let newWidth, newHeight;

      if (resizeDirectionRef.current === 'nw') {
        newWidth = originalSizeRef.current.width - deltaX;
      } else if (resizeDirectionRef.current === 'ne') {
        newWidth = originalSizeRef.current.width + deltaX;
      } else if (resizeDirectionRef.current === 'sw') {
        newWidth = originalSizeRef.current.width - deltaX;
      } else if (resizeDirectionRef.current === 'se') {
        newWidth = originalSizeRef.current.width + deltaX;
      }

      newHeight = newWidth / aspectRatio;

      // 限制最小尺寸为1%
      newWidth = Math.max(newWidth, 1);
      newHeight = Math.max(newHeight, 1);

      // 限制不超出幻灯片范围
      let newX = originalPositionRef.current.x;
      let newY = originalPositionRef.current.y;

      if (resizeDirectionRef.current === 'nw' || resizeDirectionRef.current === 'sw') {
        newX = originalPositionRef.current.x + (originalSizeRef.current.width - newWidth);
      }
      if (resizeDirectionRef.current === 'nw' || resizeDirectionRef.current === 'ne') {
        newY = originalPositionRef.current.y + (originalSizeRef.current.height - newHeight);
      }

      newX = Math.max(0, Math.min(newX, 100 - newWidth));
      newY = Math.max(0, Math.min(newY, 100 - newHeight));

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
      {/* 四个角的调整框 */}
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