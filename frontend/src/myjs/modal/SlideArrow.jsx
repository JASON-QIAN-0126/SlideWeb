import React from 'react';
import styled from 'styled-components';

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  padding: 10px;
  font-size: 1.5rem;
  color: white;
  background-color: #a594d8;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  opacity: ${({ disabled }) => (disabled ? '0.2' : '1')};
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  &:hover {
    background-color: #6950a1;
  }

  &:focus {
    outline: none;
  }

  &.prev {
    left: 10px;
  }

  &.next {
    right: 10px;
  }
`;

function SlideArrow({ handlePrevSlide, handleNextSlide, currentSlideIndex, totalSlides }) {
  return (
    <>
      <NavigationButton
        className="prev"
        onClick={handlePrevSlide}
        disabled={currentSlideIndex === 0}
      >
        &lt;
      </NavigationButton>
      <NavigationButton
        className="next"
        onClick={handleNextSlide}
        disabled={currentSlideIndex === totalSlides - 1}
      >
        &gt;
      </NavigationButton>
    </>
  );
}

export default SlideArrow;