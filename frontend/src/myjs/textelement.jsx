import React from 'react';

function TextElement({ element, onEdit }) {
  const style = {
    fontSize: `${element.properties.fontSize}em`,
    color: element.properties.color,
    whiteSpace: 'pre-wrap',
  };

  return (
    <div style={style}>
      {element.properties.text}
    </div>
  );
}

export default TextElement;