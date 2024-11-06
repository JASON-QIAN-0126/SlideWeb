import React from 'react';

function SlideThumbnail({ slide }) {
    if (!slide || !slide.elements) {
        return (
            <div
            style={{
                width: '200px',
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f0f0f0',
                color: '#999',
                fontSize: '0.9em',
            }}
            >
            No Content
            </div>
        );
        }

  return (
    <div
      style={{
        width: '200px',
        height: '150px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      <div
        style={{
          transform: 'scale(0.4)',
          transformOrigin: 'top left',
          position: 'absolute',
          width: '600px',
          height: '400px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '600px',
            height: '400px',
            backgroundColor: '#fff',
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
                    frameBorder="0"
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