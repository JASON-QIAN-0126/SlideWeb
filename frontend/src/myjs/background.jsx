import { useState } from 'react';
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
  max-height: 80vh;
  overflow-y: auto;
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

const LabelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 10px;
`;

const ColorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
`;

const GradientContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const ImageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const extractColors = (gradientValue) => {
  const colorRegex = /#([0-9A-Fa-f]{3,6})/g;
  const matches = gradientValue.match(colorRegex);
  return matches ? matches : ['#ff0000', '#0000ff'];
};

function BackgroundPicker({ show, onClose, onApply, currentBackground, isDefault, setIsDefault }) {
  const [backgroundType, setBackgroundType] = useState(currentBackground.type || 'color');
  const [colorValue, setColorValue] = useState(currentBackground.type === 'color' ? currentBackground.value : '#ffffff');
  const [gradientType, setGradientType] = useState(currentBackground.type === 'gradient' && currentBackground.value.startsWith('linear') ? 'linear' : 'radial');
  const [direction, setDirection] = useState('to right');
  const [shape, setShape] = useState('ellipse');
  const [colors, setColors] = useState(currentBackground.type === 'gradient' ? extractColors(currentBackground.value) : ['#ff0000', '#0000ff']);
  const [imageURL, setImageURL] = useState(currentBackground.type === 'image' ? currentBackground.value : '');
  const [uploadedImage, setUploadedImage] = useState('');

  const handleApply = () => {
    let value = '';
    if (backgroundType === 'color') {
      value = colorValue;
    } else if (backgroundType === 'gradient') {
      value = gradientType === 'linear' ? `linear-gradient(${direction}, ${colors.join(', ')})` : `radial-gradient(${shape}, ${colors.join(', ')})`;
    } else if (backgroundType === 'image') {
      value = imageURL || uploadedImage;
    }

    onApply({
      type: backgroundType,
      value: value,
    });
    onClose();
  };

  const handleColorChange = (index, newColor) => {
    const updatedColors = [...colors];
    updatedColors[index] = newColor;
    setColors(updatedColors);
  };

  if (!show) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <h3>Set Slide Background</h3>

        <LabelContainer>
          <label>Background Type:</label>
          <select
            value={backgroundType}
            onChange={(e) => {
              setBackgroundType(e.target.value);
              setGradientType('linear');
              setDirection('to right');
              setShape('ellipse');
              setColors(['#ff0000', '#0000ff']);
              setColorValue('#ffffff');
              setImageURL('');
              setUploadedImage('');
            }}
          >
            <option value="color">Solid Color</option>
            <option value="gradient">Gradient</option>
            <option value="image">Image</option>
          </select>
        </LabelContainer>

        {backgroundType === 'color' && (
          <LabelContainer>
            <label>Color (HEX):</label>
            <ColorContainer>
              <input
                type="color"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
              />
              <input
                type="text"
                value={colorValue}
                onChange={(e) => setColorValue(e.target.value)}
                placeholder="#ffffff"
              />
            </ColorContainer>
          </LabelContainer>
        )}

        {backgroundType === 'gradient' && (
          <GradientContainer>
            <label>Gradient Type:</label>
            <select
              value={gradientType}
              onChange={(e) => setGradientType(e.target.value)}
            >
              <option value="linear">Linear Gradient</option>
              <option value="radial">Radial Gradient</option>
            </select>

            {gradientType === 'linear' && (
              <label>Direction:</label>
            )}
            {gradientType === 'linear' && (
              <select value={direction} onChange={(e) => setDirection(e.target.value)}>
                <option value="to right">To Right</option>
                <option value="to bottom">To Bottom</option>
                <option value="45deg">45deg</option>
                <option value="135deg">135deg</option>
              </select>
            )}

            {gradientType === 'radial' && (
              <label>Shape:</label>
            )}
            {gradientType === 'radial' && (
              <select value={shape} onChange={(e) => setShape(e.target.value)}>
                <option value="ellipse">Ellipse</option>
                <option value="circle">Circle</option>
              </select>
            )}

            <div>
              <label>Colors:</label>
              {colors.map((color, index) => (
                <ColorContainer key={index}>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                    placeholder="#ffffff"
                  />
                </ColorContainer>
              ))}
              <button onClick={() => setColors([...colors, '#ffffff'])}>Add Color</button>
            </div>
          </GradientContainer>
        )}

        {backgroundType === 'image' && (
          <ImageContainer>
            <label>Image URL:</label>
            <input
              type="text"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <label>OR Upload Image:</label>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setUploadedImage(reader.result);
                reader.readAsDataURL(file);
              }
            }} />
          </ImageContainer>
        )}

        <CheckboxContainer>
          <input
            type="checkbox"
            checked={isDefault}
            onChange={(e) => setIsDefault(e.target.checked)}
          />
          <label style={{ marginLeft: '5px' }}>Set as default background for all slides</label>
        </CheckboxContainer>

        <ButtonContainer>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <UpdateButton onClick={handleApply}>Apply</UpdateButton>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
}

export default BackgroundPicker;