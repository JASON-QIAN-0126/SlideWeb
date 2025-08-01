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
  padding: 30px;
  max-height: 85vh;
  width: 600px;
  max-width: 90%;
  overflow-y: auto;
  box-shadow: 0px 8px 32px rgba(0, 0, 0, 0.15);
  border-radius: 12px;
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
  margin-bottom: 20px;
  width: 100%;

  label {
    flex: 1;
    font-size: 1rem;
    color: #333;
    min-width: 100px;
    font-weight: 500;
  }

  input, select, textarea {
    flex: 2;
    padding: 10px 12px;
    font-size: 1rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #6950a1;
    box-shadow: 0 0 0 3px rgba(105, 80, 161, 0.1);
  }

  textarea {
    resize: vertical;
    min-height: 80px;
  }

  input[type="color"] {
    width: 50px;
    height: 40px;
    padding: 2px;
    cursor: pointer;
  }

  input[type="file"] {
    padding: 8px;
    border: 2px dashed #e1e5e9;
    background: #f8f9fa;
  }

  input[type="file"]:hover {
    border-color: #6950a1;
    background: #f0f0f0;
  }
`;

const ControlRow = styled.div`
  display: flex;
  gap: 25px;
  margin-bottom: 25px;
  width: 100%;
`;

const ControlColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const CheckboxRow = styled.div`
  display: flex;
  gap: 30px;
  margin-bottom: 20px;
  width: 100%;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }

  label {
    font-size: 1rem;
    color: #333;
    font-weight: 500;
    margin: 0;
    cursor: pointer;
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
  handleVideoFileChange,
}) {
  if (!showModal) return null;

  const titleText = editingElementId
    ? `编辑${getTypeName(modalType)}`
    : `添加${getTypeName(modalType)}`;

  function getTypeName(type) {
    switch (type) {
      case 'text': return '文本';
      case 'image': return '图片';
      case 'video': return '视频';
      case 'code': return '代码';
      default: return type;
    }
  }

  return (
    <ModalOverlay>
      <ModalContainer>
        <Title>{titleText}</Title>

        {modalType === 'text' && (
          <>
            <FormGroup>
              <label>文本:</label>
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
              <label>字体大小:</label>
              <input
                type="number"
                min="0.5"
                max="5"
                step="0.1"
                value={elementProperties.fontSize || 1}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    fontSize: parseFloat(e.target.value),
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>字体:</label>
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
                <option value="微软雅黑">微软雅黑</option>
                <option value="宋体">宋体</option>
              </select>
            </FormGroup>
            <FormGroup>
              <label>颜色:</label>
              <input
                type="color"
                value={elementProperties.color || '#000000'}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    color: e.target.value,
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>字体粗细:</label>
              <select
                value={elementProperties.fontWeight || 'normal'}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    fontWeight: e.target.value,
                  })
                }
              >
                <option value="normal">正常</option>
                <option value="bold">粗体</option>
                <option value="lighter">细体</option>
              </select>
            </FormGroup>
          </>
        )}
        {modalType === 'image' && (
          <>
            <FormGroup>
              <label>图片URL:</label>
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
              <label>上传图片:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
              />
            </FormGroup>
            <FormGroup>
              <label>Alt文本:</label>
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
            <FormGroup>
              <label>对象适应:</label>
              <select
                value={elementProperties.objectFit || 'cover'}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    objectFit: e.target.value,
                  })
                }
              >
                <option value="cover">覆盖</option>
                <option value="contain">包含</option>
                <option value="fill">填充</option>
              </select>
            </FormGroup>
          </>
        )}
        {modalType === 'video' && (
          <>
            <FormGroup>
              <label>视频URL:</label>
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
              <label>上传视频:</label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
              />
            </FormGroup>
            <CheckboxRow>
              <CheckboxGroup>
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={elementProperties.autoplay || false}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      autoplay: e.target.checked,
                    })
                  }
                />
                <label htmlFor="autoplay">自动播放</label>
              </CheckboxGroup>
              <CheckboxGroup>
                <input
                  type="checkbox"
                  id="loop"
                  checked={elementProperties.loop || false}
                  onChange={(e) =>
                    setElementProperties({
                      ...elementProperties,
                      loop: e.target.checked,
                    })
                  }
                />
                <label htmlFor="loop">循环播放</label>
              </CheckboxGroup>
            </CheckboxRow>
          </>
        )}
        {modalType === 'code' && (
          <>
            <FormGroup>
              <label>代码:</label>
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
              <label>字体大小:</label>
              <input
                type="number"
                min="0.5"
                max="3"
                step="0.1"
                value={elementProperties.fontSize || 1}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    fontSize: parseFloat(e.target.value),
                  })
                }
              />
            </FormGroup>
            <FormGroup>
              <label>主题:</label>
              <select
                value={elementProperties.theme || 'default'}
                onChange={(e) =>
                  setElementProperties({
                    ...elementProperties,
                    theme: e.target.value,
                  })
                }
              >
                <option value="default">默认</option>
                <option value="dark">暗色</option>
                <option value="light">亮色</option>
              </select>
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