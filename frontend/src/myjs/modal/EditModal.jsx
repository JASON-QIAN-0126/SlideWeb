import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 90%;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 10px;
`;

const UpdateButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: #6950a1;
  color: white;
  font-weight: bold;

  &:hover {
    background-color: #4d3a78;
  }
`;

const CancelButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #6950a1;
  border-radius: 5px;
  cursor: pointer;
  background-color: white;
  color: #6950a1;
  font-weight: bold;

  &:hover {
    background-color: #ddd;
  }
`;

const EditModal = ({ title, value, onChange, onSave, onClose, placeholder, isTextArea }) => (
  <ModalOverlay>
    <ModalContent>
      <h3>{title}</h3>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: '85%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ width: '85%', padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
      )}
      <ButtonContainer>
        <CancelButton onClick={onClose}>Cancel</CancelButton>
        <UpdateButton onClick={onSave}>Update</UpdateButton>
      </ButtonContainer>
    </ModalContent>
  </ModalOverlay>
);

export default EditModal;