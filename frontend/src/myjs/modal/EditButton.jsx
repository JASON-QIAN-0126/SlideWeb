import React from 'react';
import styled from 'styled-components';

const ButtonBarContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  gap: 15px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  color: #6950a1;
  background-color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  
  &:hover {
    background-color: #6950a1;
    color: white;
    transform: scale(1.1);
  }
`;

const ButtonBar = ({ onEditTitle, onEditDescription, onUpdateThumbnail }) => (
  <ButtonBarContainer>
    <StyledButton onClick={onEditTitle}>Edit Title</StyledButton>
    <StyledButton onClick={onEditDescription}>Edit Description</StyledButton>
    <StyledButton onClick={onUpdateThumbnail}>Update Thumbnail</StyledButton>
  </ButtonBarContainer>
);

export default ButtonBar;