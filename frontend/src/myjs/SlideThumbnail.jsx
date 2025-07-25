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
              top: `${element.position?.y || 0}%`,
              left: `${element.position?.x || 0}%`,
              width: `${element.size?.width || 10}%`,
              height: `${element.size?.height || 10}%`,
              overflow: 'hidden',
            };
            
            // 兼容新旧数据结构：优先使用element.properties，如果不存在则直接使用element的属性
            const props = element.properties || element;
            
            let content = null;
            switch (element.type) {
            case 'text':
              content = (
                <div
                  style={{
                    fontSize: `${props.fontSize || 1}em`,
                    color: props.color || '#000000',
                    whiteSpace: 'pre-wrap',
                    fontFamily: props.fontFamily || 'Arial',
                  }}
                >
                  {props.text || '文本'}
                </div>
              );
              break;
            case 'image':
              content = props.src ? (
                <img
                  src={props.src}
                  alt={props.alt || '图片'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f0f0f0',
                  color: '#666'
                }}>
                  图片
                </div>
              );
              break;
            case 'video':
              content = props.videoId ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${props.videoId}`}
                  allowFullScreen
                ></iframe>
              ) : (
                <div style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#f0f0f0',
                  color: '#666'
                }}>
                  视频
                </div>
              );
              break;
            case 'code':
              content = (
                <pre
                  style={{
                    fontSize: `${props.fontSize || 1}em`,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    background: '#f8f8f8',
                    padding: '4px',
                    borderRadius: '2px',
                    color: '#333'
                  }}
                >
                  {props.code || '代码'}
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