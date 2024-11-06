import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ModalHeader = styled.h3`
  margin-top: 0;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;

  button {
    margin-left: 10px;
  }
`;

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <Overlay>
      <ModalContainer>
        <ModalHeader>{title}</ModalHeader>
        <p>{message}</p>
        <ModalButtons>
          <button onClick={onCancel}>Cancel</button>
          <button onClick={onConfirm}>Confirm</button>
        </ModalButtons>
      </ModalContainer>
    </Overlay>
  );
}

export default ConfirmModal;