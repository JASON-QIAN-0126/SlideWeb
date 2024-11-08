import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const FadeContainer = styled.div`
  transition: opacity 0.5s ease-in-out;
  opacity: ${({ $fadeState }) => ($fadeState === 'fade-in' ? 1 : 0)};
`;

function Animation({ children }) {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [fadeState, setFadeState] = useState('fade-in');

  useEffect(() => {
    setFadeState('fade-out');
    const timeout = setTimeout(() => {
      setDisplayChildren(children);
      setFadeState('fade-in');
    }, 500);
    return () => clearTimeout(timeout);
  }, [children]);

  return (
    <FadeContainer $fadeState={fadeState}>
      {displayChildren}
    </FadeContainer>
  );
}

export default Animation;