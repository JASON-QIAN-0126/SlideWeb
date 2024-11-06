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
  width: 600px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const MessageText = styled.p`
  font-size: 1.1em;
  color: #333;
  line-height: 1.5;
  text-align: center;
  margin: 0 0 20px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;

  button {
    font-size: 1em;
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background-color: #007bff;
    color: white;
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #0056b3;
    }
  }
`;

function NotificationModal({ message, onClose }) {
  return (
    <Overlay>
      <ModalContainer>
        <MessageText>{message}</MessageText>
        <ModalButtons>
          <button onClick={onClose}>OK</button>
        </ModalButtons>
      </ModalContainer>
    </Overlay>
  );
}

export default NotificationModal;