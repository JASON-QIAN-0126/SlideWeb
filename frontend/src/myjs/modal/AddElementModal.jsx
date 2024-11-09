import React from 'react';
import styled from 'styled-components';

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

  return (
    <ModalOverlay>
      <ModalContainer>
        <Title>{editingElementId ? 'Edit Element' : 'Add Element'}</Title>
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