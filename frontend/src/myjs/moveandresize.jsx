import React, { useState, useEffect } from 'react';

function MoveAndResize({ element, updateElementPositionSize, children }) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [originalPosition, setOriginalPosition] = useState({ x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });

  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (e.button !== 0) return; // 只响应左键
    setIsDragging(true);
    setStartX(e.clientX);
    setStartY(e.clientY);
    setOriginalPosition({ ...element.position });
    setOriginalSize({ ...element.size });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const deltaX = ((e.clientX - startX) / 600) * 100; // 600为幻灯片宽度
      const deltaY = ((e.clientY - startY) / 400) * 100; // 400为幻灯片高度

      let newX = originalPosition.x + deltaX;
      let newY = originalPosition.y + deltaY;

      // 限制在幻灯片范围内
      newX = Math.max(0, Math.min(newX, 100 - element.size.width));
      newY = Math.max(0, Math.min(newY, 100 - element.size.height));

      updateElementPositionSize(element.id, {
        position: {
          x: newX,
          y: newY,
        },
        size: element.size,
      });
    }

    if (isResizing) {
      const deltaX = ((e.clientX - startX) / 600) * 100; // 600为幻灯片宽度
      const deltaY = ((e.clientY - startY) / 400) * 100; // 400为幻灯片高度

      let aspectRatio = originalSize.width / originalSize.height;
      let newWidth, newHeight;

      if (resizeDirection === 'nw') {
        newWidth = originalSize.width - deltaX;
      } else if (resizeDirection === 'ne') {
        newWidth = originalSize.width + deltaX;
      } else if (resizeDirection === 'sw') {
        newWidth = originalSize.width - deltaX;
      } else if (resizeDirection === 'se') {
        newWidth = originalSize.width + deltaX;
      }

      newHeight = newWidth / aspectRatio;

      // 限制最小尺寸为1%
      newWidth = Math.max(newWidth, 1);
      newHeight = Math.max(newHeight, 1);

      // 限制不超出幻灯片范围
      let newX = originalPosition.x;
      let newY = originalPosition.y;

      if (resizeDirection === 'nw' || resizeDirection === 'sw') {
        newX = originalPosition.x + (originalSize.width - newWidth);
      }
      if (resizeDirection === 'nw' || resizeDirection === 'ne') {
        newY = originalPosition.y + (originalSize.height - newHeight);
      }

      newX = Math.max(0, Math.min(newX, 100 - newWidth));
      newY = Math.max(0, Math.min(newY, 100 - newHeight));

      updateElementPositionSize(element.id, {
        position: {
          x: newX,
          y: newY,
        },
        size: {
          width: newWidth,
          height: newHeight,
        },
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
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

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

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