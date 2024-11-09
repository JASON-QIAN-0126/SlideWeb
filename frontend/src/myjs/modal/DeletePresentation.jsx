import React from 'react';
import styled from 'styled-components';
import ConfirmModal from './confirmmodal';

const Button = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  color: #6950a1;
  background-color: white;
  border: 1px solid #6950a1;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  margin: 10px;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #6950a1;
    color: white;
    transform: scale(1.1);
  }

  &:active {
    background-color: #afb4db;
    transform: scale(0.98);
  }
`;

const DeletePresentationButton = styled(Button)`
  position: absolute;
  top: 20px;
  right: 20px;
`;

const DeletePresentation = ({ 
  isConfirmModalOpen, 
  handleDeletePresentation, 
  handleConfirmDelete, 
  handleCancelDelete 
}) => {
  return (
    <>
      <DeletePresentationButton onClick={handleDeletePresentation}>
        Delete Presentation
      </DeletePresentationButton>
      {isConfirmModalOpen && (
        <ConfirmModal
          title="Delete Confirmation"
          message="Are you sure you want to delete this presentation?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </>
  );
};

export default DeletePresentation;