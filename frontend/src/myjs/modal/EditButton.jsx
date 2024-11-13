import styled from 'styled-components';

const ButtonBarContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
  gap: 6px;

  @media (min-width: 600px) {
    margin-bottom: 10px;
    gap: 10px;
  }
`;

const StyledButton = styled.button`
  padding: 2px 4px;
  font-size: 0.8rem;
  color: #6950a1;
  background-color: white;
  border: 1px solid #6950a1;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  
  &:hover {
    background-color: #6950a1;
    color: white;
    transform: scale(1.1);
  }

  @media (min-width: 600px) {
    padding: 6px 8px;
    font-size: 1rem;
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