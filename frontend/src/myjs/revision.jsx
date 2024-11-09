import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  max-width: 600px;
  width: 90%;
  border-radius: 8px;
  box-shadow: 0px 0px 15px rgba(182, 150, 193, 0.3);
  text-align: center;
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #6950a1;
`;

const HistoryList = styled.ul`
  list-style: none;
  padding: 0;
  max-height: 60vh;
  overflow-y: auto;
  margin-bottom: 20px;
`;

const HistoryItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  color: #333;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  background-color: white;
  color: #6950a1;
  border: 1px solid #6950a1;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #ddd;
    transform: scale(1.05);
  }
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

function RevisionHistory({ history, onRestore, onClose }) {
  return (
    <Overlay>
      <ModalContainer>
        <Title>Revision History</Title>
        <HistoryList>
          {history.map((entry, index) => (
            <HistoryItem key={index}>
              <span>{new Date(entry.timestamp).toLocaleString()}</span>
              <UpdateButton onClick={() => onRestore(entry)}>Restore</UpdateButton>
            </HistoryItem>
          ))}
        </HistoryList>
        <CancelButton onClick={onClose}>Close</CancelButton>
      </ModalContainer>
    </Overlay>
  );
}

export default RevisionHistory;