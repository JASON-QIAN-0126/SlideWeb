function TextElement({ element, onEdit }) {
  const style = {
    fontSize: `${element.properties.fontSize}em`,
    color: element.properties.color,
    whiteSpace: 'pre-wrap',
    fontFamily: element.properties.fontFamily || 'Arial',
  };

  return (
    <div style={style}>
      {element.properties.text}
    </div>
  );
}

export default TextElement;