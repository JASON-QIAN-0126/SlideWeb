import React from 'react';

function ImageElement({ element, onEdit }) {
  return (
    <img
      src={element.properties.src}
      alt={element.properties.alt}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      onDoubleClick={() => onEdit(element)}
    />
  );
}

export default ImageElement;