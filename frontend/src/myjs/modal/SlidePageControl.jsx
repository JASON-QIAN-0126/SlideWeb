import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  gap: 5px;
  margin-top: 15px;
  margin-bottom: 15px;
  justify-content: center;

  @media (min-width: 600px) {
    gap: 15px;
    margin-top: 10px;
    margin-bottom: 10px;
  }
`;

const StyledButton = styled.button`
  padding: 2px 8px;
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
    transform: scale(1.05);
  }

  @media (min-width: 600px) {
    padding: 8px 16px;
    font-size: 1rem;
  }
`;

function SlideControls({ handleAddSlide, handleDeleteSlide, onPreview, isNotificationOpen, setNotificationOpen,NotificationModal }) {
  return (
    <ButtonContainer>
      <StyledButton onClick={handleAddSlide}>Add Slide</StyledButton>
      <StyledButton onClick={handleDeleteSlide}>Delete Slide</StyledButton>
      {isNotificationOpen && (
        <NotificationModal
          message="Cannot delete the only slide. Consider deleting the presentation."
          onClose={() => setNotificationOpen(false)}
        />
      )}
      <StyledButton onClick={onPreview}>Preview</StyledButton>
    </ButtonContainer>
  );
}

export default SlideControls;