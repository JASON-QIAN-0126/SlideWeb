import { useRef, useEffect, useState } from 'react';
import hljs from 'highlight.js/lib/core';

import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';

import styled from 'styled-components';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('c', c);

// css-in-js
const HighlightStyles = styled.div`
  .hljs-comment,
  .hljs-quote {
    color: #998;
    font-style: italic;
  }
  .hljs-keyword,
  .hljs-selector-tag,
  .hljs-subst {
    color: #333;
    font-weight: bold;
  }
  .hljs-number,
  .hljs-literal,
  .hljs-variable,
  .hljs-template-variable,
  .hljs-tag .hljs-attr {
    color: #008080;
  }
  .hljs-string,
  .hljs-doctag {
    color: #d14;
  }
  .hljs-title,
  .hljs-section,
  .hljs-selector-id {
    color: #900;
    font-weight: bold;
  }
  .hljs-subst {
    font-weight: normal;
  }
  .hljs-type,
  .hljs-class .hljs-title {
    color: #458;
    font-weight: bold;
  }
  .hljs-tag,
  .hljs-name,
  .hljs-attribute {
    color: #000080;
    font-weight: normal;
  }
  .hljs-regexp,
  .hljs-link {
    color: #009926;
  }
  .hljs-symbol,
  .hljs-bullet {
    color: #990073;
  }
  .hljs-built_in,
  .hljs-builtin-name {
    color: #0086b3;
  }
  .hljs-meta {
    color: #999;
    font-weight: bold;
  }
  .hljs-deletion {
    background: #fdd;
  }
  .hljs-addition {
    background: #dfd;
  }
  .hljs-emphasis {
    font-style: italic;
  }
  .hljs-strong {
    font-weight: bold;
  }
`;

const StyledPre = styled.pre`
  font-size: ${(props) => props.fontSize}em;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  cursor: pointer;
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  padding: 10px;
  border-radius: 4px;
`;

function CodeElement({ element, onUpdateElement}) {
  const codeRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState(element.properties.code || '');

  useEffect(() => {
    if (codeRef.current && !isEditing) {
      hljs.highlightElement(codeRef.current);
    }
  }, [element.properties.code, element.properties.language, isEditing]);

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditCode(element.properties.code || '');
  };

  const handleSave = () => {
    if (onUpdateElement) {
      onUpdateElement(element.id, { code: editCode });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditCode(element.properties.code || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = editCode.substring(0, start) + '  ' + editCode.substring(end);
      setEditCode(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <StyledPre fontSize={element.properties.fontSize || 1}>
        <textarea
          value={editCode}
          onChange={(e) => setEditCode(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          autoFocus
          style={{
            width: '100%',
            height: '100%',
            border: '2px solid #6950a1',
            borderRadius: '4px',
            outline: 'none',
            resize: 'none',
            background: 'rgba(255, 255, 255, 0.9)',
            fontFamily: 'monospace',
            fontSize: `${element.properties.fontSize || 1}em`,
            padding: '10px',
            boxSizing: 'border-box',
          }}
        />
      </StyledPre>
    );
  }

  return (
    <HighlightStyles>
      <StyledPre fontSize={element.properties.fontSize || 1} onDoubleClick={handleDoubleClick}>
        <code 
          ref={codeRef} 
          className={`language-${element.properties.language || 'javascript'}`}
        >
          {element.properties.code || '双击编辑代码'}
        </code>
      </StyledPre>
    </HighlightStyles>
  );
}

export default CodeElement;