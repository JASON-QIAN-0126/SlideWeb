import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
  align-items: center;
`;

const StyledButton = styled.button`
  padding: 8px 16px;
  font-size: 1rem;
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

  &:focus {
    outline: none;
  }
`;

function AddButtonModal({ handleAddElement }) {
  return (
    <ButtonContainer>
      <StyledButton onClick={() => handleAddElement('text')}>Add Text</StyledButton>
      <StyledButton onClick={() => handleAddElement('image')}>Add Image</StyledButton>
      <StyledButton onClick={() => handleAddElement('video')}>Add Video</StyledButton>
      <StyledButton onClick={() => handleAddElement('code')}>Add Code</StyledButton>
    </ButtonContainer>
  );
}

export default AddButtonModal;