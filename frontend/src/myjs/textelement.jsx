function TextElement({ element}) {
  const style = {
    fontSize: `${element.properties.fontSize || 1}em`,
    color: element.properties.color || '#000000',
    whiteSpace: 'pre-wrap',
    fontFamily: element.properties.fontFamily || 'Arial',
    textAlign: element.properties.textAlign || 'left',
    fontWeight: element.properties.fontWeight || 'normal',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: element.properties.textAlign === 'center' ? 'center' : 'flex-start',
    justifyContent: element.properties.textAlign === 'center' ? 'center' : 
                   element.properties.textAlign === 'right' ? 'flex-end' : 'flex-start',
    padding: '4px',
    boxSizing: 'border-box',
  };

  return (
    <div style={style}>
      {element.properties.text}
    </div>
  );
}

export default TextElement;