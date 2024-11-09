import styled from 'styled-components';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 5%;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background-color: #fff;
  padding: 20px;
  max-height: 80vh;
  width: 400px;
  max-width: 80%;
  overflow-y: auto;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Title = styled.h3`
  color: #6950a1;
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
`;

const FormGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  width: 100%;

  label {
    flex: 1;
    font-size: 0.9rem;
    color: #333;
  }

  input, select, textarea {
    flex: 2;
    padding: 5px;
    font-size: 0.9rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  textarea {
    resize: vertical;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
`;

const StyledButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s ease;
  color: ${({ $cancel }) => ($cancel ? '#6950a1' : 'white')};
  background-color: ${({ $cancel }) => ($cancel ? 'white' : '#6950a1')};
  border: ${({ $cancel }) => ($cancel ? '1px solid #6950a1' : 'none')};

  &:hover {
    background-color: ${({ $cancel }) => ($cancel ? '#ddd' : '#4d3a78')};
  }
`;

function AddElementModal({
  showModal,
  modalType,
  editingElementId,
  elementProperties,
  setElementProperties,
  handleSaveElement,
  handleUpdateElement,
  setShowModal,
  handleImageFileChange,
}) {
  if (!showModal) return null;

  const titleText = editingElementId
    ? `Edit ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`
    : `Add ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`;

  return (
    <ModalOverlay>
      <ModalContainer>
        <Title>{titleText}</Title>
        {!editingElementId && (
          <>
            <FormGroup>
              <label>Width (%):</label>
              <input
                type="number"
                value={elementProperties.size?.width || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    size: {
                      ...elementProperties.size,
                      width: e.target.value,
                    },
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>Height (%):</label>
              <input
                type="number"
                value={elementProperties.size?.height || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    size: {
                      ...elementProperties.size,
                      height: e.target.value,
                    },
                  })
                }
              />
            </FormGroup>
          </>
        )}
        {modalType === 'text' && (
          <>
            <FormGroup>
              <label>Text:</label>
              <textarea
                value={elementProperties.text || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    text: e.target.value,
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>Font Size (em):</label>
              <input
                type="number"
                value={elementProperties.fontSize || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    fontSize: e.target.value,
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>Font Family:</label>
              <select
                value={elementProperties.fontFamily || 'Arial'}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    fontFamily: e.target.value,
                  })
                }
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
            </FormGroup>
            <FormGroup>
              <label>Color (HEX):</label>
              <input
                type="text"
                value={elementProperties.color || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    color: e.target.value,
                  })
                }
              />
            </FormGroup>
          </>
        )}
        {modalType === 'image' && (
          <>
            <FormGroup>
              <label>Image URL:</label>
              <input
                type="text"
                value={elementProperties.src || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    src: e.target.value,
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>OR Upload Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Alt Text:</label>
              <input
                type="text"
                value={elementProperties.alt || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    alt: e.target.value,
                  })
                }
              />
            </FormGroup>
          </>
        )}
        {modalType === 'video' && (
          <>
            <FormGroup>
              <label>YouTube Video URL:</label>
              <input
                type="text"
                value={elementProperties.videoUrl || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    videoUrl: e.target.value,
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>Auto Play:</label>
              <input
                type="checkbox"
                checked={elementProperties.autoplay || false}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    autoplay: e.target.checked,
                  })
                }
              />
            </FormGroup>
          </>
        )}
        {modalType === 'code' && (
          <>
            <FormGroup>
              <label>Code:</label>
              <textarea
                value={elementProperties.code || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    code: e.target.value,
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>Font Size (em):</label>
              <input
                type="number"
                value={elementProperties.fontSize || ''}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    fontSize: e.target.value,
                  })
                }
              />
            </FormGroup>
          </>
        )}
        <ButtonContainer>
          <StyledButton onClick={() => setShowModal(false)} $cancel>
            Cancel
          </StyledButton>
          <StyledButton onClick={editingElementId ? handleUpdateElement : handleSaveElement}>
            {editingElementId ? 'Update' : 'Add'}
          </StyledButton>
        </ButtonContainer>
      </ModalContainer>
    </ModalOverlay>
  );
}

export default AddElementModal;