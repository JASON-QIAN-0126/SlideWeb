function SlideThumbnail({ slide }) {
  if (!slide || !slide.elements) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '200px',
          margin: '0 auto',
          aspectRatio: '16 / 9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
          color: '#999',
          fontSize: '0.9em',
        }}
      >
      </div>
    );
  }

  const originalSlideWidth = 1000;
  const originalSlideHeight = 562.5;

  const containerMaxWidth = 200; 
  const scalingFactor = containerMaxWidth / originalSlideWidth;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: `${containerMaxWidth}px`,
        margin: '0 auto',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: `${originalSlideWidth}px`,
          height: `${originalSlideHeight}px`,
          transform: `scale(${scalingFactor})`,
          transformOrigin: 'top left',
          top: 0,
          left: 0,
        }}
      >
        {slide.background && (
          <div
            style={{
              position: 'absolute',
              width: `${originalSlideWidth}px`,
              height: `${originalSlideHeight}px`,
              top: 0,
              left: 0,
              ...(() => {
                const { type, value } = slide.background;
                switch (type) {
                case 'color':
                  return { backgroundColor: value };
                case 'gradient':
                  return { backgroundImage: value };
                case 'image':
                  return {
                    backgroundImage: `url(${value})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  };
                default:
                  return {};
                }
              })(),
            }}
          ></div>
        )}

        <div
          style={{
            position: 'relative',
            width: `${originalSlideWidth}px`,
            height: `${originalSlideHeight}px`,
          }}
        >
          {slide.elements.map((element) => {
            const style = {
              position: 'absolute',
              top: `${element.position.y}%`,
              left: `${element.position.x}%`,
              width: `${element.size.width}%`,
              height: `${element.size.height}%`,
              overflow: 'hidden',
            };
            let content = null;
            switch (element.type) {
            case 'text':
              content = (
                <div
                  style={{
                    fontSize: `${element.properties.fontSize}em`,
                    color: element.properties.color,
                    whiteSpace: 'pre-wrap',
                    fontFamily: element.properties.fontFamily,
                  }}
                >
                  {element.properties.text}
                </div>
              );
              break;
            case 'image':
              content = (
                <img
                  src={element.properties.src}
                  alt={element.properties.alt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              );
              break;
            case 'video':
              content = (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${element.properties.videoId}`}
                  allowFullScreen
                ></iframe>
              );
              break;
            case 'code':
              content = (
                <pre
                  style={{
                    fontSize: `${element.properties.fontSize}em`,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {element.properties.code}
                </pre>
              );
              break;
            default:
              break;
            }
            return (
              <div key={element.id} style={style}>
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SlideThumbnail;