import React, { useState } from 'react';

// Function to extract HEX colors from a gradient string
const extractColors = (gradientValue) => {
  const colorRegex = /#([0-9A-Fa-f]{3,6})/g;
  const matches = gradientValue.match(colorRegex);
  return matches ? matches : ['#ff0000', '#0000ff'];
};

function BackgroundPicker({ 
  show, 
  onClose, 
  onApply, 
  currentBackground, 
  isDefault, 
  setIsDefault 
}) {
  const [backgroundType, setBackgroundType] = useState(currentBackground.type || 'color');
  const [colorValue, setColorValue] = useState(currentBackground.type === 'color' ? currentBackground.value : '#ffffff');
  const [gradientType, setGradientType] = useState(
    currentBackground.type === 'gradient' && currentBackground.value.startsWith('linear') ? 'linear' : 'radial'
  );
  const [direction, setDirection] = useState('to right'); // Direction for linear gradients
  const [shape, setShape] = useState('ellipse'); // Shape for radial gradients
  const [colors, setColors] = useState(
    currentBackground.type === 'gradient' ? extractColors(currentBackground.value) : ['#ff0000', '#0000ff']
  );
  const [imageURL, setImageURL] = useState(currentBackground.type === 'image' ? currentBackground.value : '');
  const [uploadedImage, setUploadedImage] = useState('');

  const handleApply = () => {
    let value = '';
    if (backgroundType === 'color') {
      value = colorValue;
    } else if (backgroundType === 'gradient') {
      if (gradientType === 'linear') {
        value = `linear-gradient(${direction}, ${colors.join(', ')})`;
      } else if (gradientType === 'radial') {
        value = `radial-gradient(${shape}, ${colors.join(', ')})`;
      }
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

  const addColor = () => {
    setColors([...colors, '#ffffff']);
  };

  const removeColor = (index) => {
    const updatedColors = colors.filter((_, i) => i !== index);
    setColors(updatedColors);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result); // base64 data
      };
      reader.readAsDataURL(file);
    }
  };

  if (!show) return null;

  return (
    <div className="modal" style={modalStyle}>
      <h3>Set Slide Background</h3>
      <label>
        Background Type:
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
      </label>

      {backgroundType === 'color' && (
        <label>
          Color (HEX):
          <input
            type="color"
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
            style={{ marginLeft: '10px' }}
          />
          <input
            type="text"
            value={colorValue}
            onChange={(e) => setColorValue(e.target.value)}
            placeholder="#ffffff"
            style={{ marginLeft: '10px', width: '100px' }}
          />
        </label>
      )}

      {backgroundType === 'gradient' && (
        <>
          <label>
            Gradient Type:
            <select
              value={gradientType}
              onChange={(e) => setGradientType(e.target.value)}
            >
              <option value="linear">Linear Gradient</option>
              <option value="radial">Radial Gradient</option>
            </select>
          </label>

          {gradientType === 'linear' && (
            <label>
              Direction:
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
              >
                <option value="to right">To Right</option>
                <option value="to bottom">To Bottom</option>
                <option value="45deg">45deg</option>
                <option value="135deg">135deg</option>
              </select>
            </label>
          )}

          {gradientType === 'radial' && (
            <label>
              Shape:
              <select
                value={shape}
                onChange={(e) => setShape(e.target.value)}
              >
                <option value="ellipse">Ellipse</option>
                <option value="circle">Circle</option>
              </select>
            </label>
          )}

          <div>
            <label>Colors:</label>
            {colors.map((color, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  style={{ marginRight: '10px' }}
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => handleColorChange(index, e.target.value)}
                  placeholder="#ffffff"
                  style={{ width: '100px' }}
                />
                {colors.length > 2 && (
                  <button onClick={() => removeColor(index)} style={{ marginLeft: '10px' }}>Remove</button>
                )}
              </div>
            ))}
            <button onClick={addColor}>Add Color</button>
          </div>
        </>
      )}

      {backgroundType === 'image' && (
        <>
          <label>
            Image URL:
            <input
              type="text"
              value={imageURL}
              onChange={(e) => setImageURL(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{ marginLeft: '10px', width: '100%' }}
            />
          </label>
          <label>
            OR Upload Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              style={{ marginLeft: '10px' }}
            />
          </label>
        </>
      )}

      <label>
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
        />
        Set as default background for all slides
      </label>
      <button onClick={handleApply} style={{ marginRight: '10px' }}>Apply</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

const modalStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#fff',
  padding: '20px',
  maxHeight: '80vh',
  overflowY: 'auto',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
  zIndex: 1000,
};

export default BackgroundPicker;