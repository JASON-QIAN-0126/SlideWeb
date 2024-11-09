import React from 'react';

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
    <div
      className="modal"
      style={{
        position: 'fixed',
        top: '10%',
        left: '50%',
        transform: 'translate(-50%, 0)',
        backgroundColor: '#fff',
        padding: '20px',
        maxHeight: '80%',
        overflowY: 'auto',
        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
      }}
    >
      <h3>{editingElementId ? 'Edit Element' : 'Add Element'}</h3>
      <label>
        Width (%):
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
      </label>
      <label>
        Height (%):
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
      </label>
      {modalType === 'video' && (
        <>
          <label>
            YouTube Video URL:
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
          </label>
          <label>
            Auto Play:
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
          </label>
        </>
      )}
      {modalType === 'code' && (
        <>
          <label>
            Code:
            <textarea
              value={elementProperties.code || ''}
              onChange={(e) =>
                setElementProperties({
                  ...elementProperties,
                  code: e.target.value,
                })
              }
            />
          </label>
          <label>
            Font Size (em):
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
          </label>
        </>
      )}
      <button onClick={editingElementId ? handleUpdateElement : handleSaveElement}>
        {editingElementId ? 'Update' : 'Add'}
      </button>
      <button onClick={() => setShowModal(false)}>Cancel</button>
    </div>
  );
}

export default AddElementModal;