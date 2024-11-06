import React, { useRef, useEffect } from 'react';
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

function CodeElement({ element, onEdit }) {
  const codeRef = useRef(null);

  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current);
    }
  }, [element.properties.code]);

  return (
    <HighlightStyles>
      <StyledPre fontSize={element.properties.fontSize || 1}>
        <code ref={codeRef}>{element.properties.code}</code>
      </StyledPre>
    </HighlightStyles>
  );
}

export default CodeElement;