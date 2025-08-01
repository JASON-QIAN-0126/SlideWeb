function ImageElement({ element}) {
  return (
    <img
      src={element.properties.src}
      alt={element.properties.alt}
      style={{ 
        width: '100%', 
        height: '100%', 
        objectFit: element.properties.objectFit || 'cover' 
      }}
    />
  );
}

export default ImageElement;