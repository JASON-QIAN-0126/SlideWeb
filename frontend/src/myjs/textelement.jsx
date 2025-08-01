import { useState } from 'react';

function TextElement({ element, onUpdateElement}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(element.properties.text || '');

  const style = {
    fontSize: `${element.properties.fontSize || 1}em`,
    color: element.properties.color || '#000000',
    whiteSpace: 'pre-wrap',
    fontFamily: element.properties.fontFamily || 'Arial',
    textAlign: element.properties.textAlign || 'left',
    fontWeight: element.properties.fontWeight || 'normal',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: element.properties.textAlign === 'center' ? 'center' : 'flex-start',
    justifyContent: element.properties.textAlign === 'center' ? 'center' : 
                   element.properties.textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: '4px',
    boxSizing: 'border-box',
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(element.properties.text || '');
  };

  const handleSave = () => {
    if (onUpdateElement) {
      onUpdateElement(element.id, { text: editText });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(element.properties.text || '');
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        autoFocus
        style={{
          ...style,
          border: '2px solid #6950a1',
          borderRadius: '4px',
          outline: 'none',
          resize: 'none',
          background: 'rgba(255, 255, 255, 0.9)',
        }}
      />
    );
  }

  return (
    <div style={style} onDoubleClick={handleDoubleClick}>
      {element.properties.text || '双击编辑文本'}
    </div>
  );
}

export default TextElement;