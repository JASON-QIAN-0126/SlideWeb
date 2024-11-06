import React from 'react';

function CodeElement({ element, onEdit }) {
  return (
    <pre
      style={{
        fontSize: `${element.properties.fontSize}em`,
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        color: '#333',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '4px',
        overflowX: 'auto',
      }}
      onDoubleClick={() => onEdit(element)}
    >
      <code>
        {element.properties.code}
      </code>
    </pre>
  );
}

export default CodeElement;