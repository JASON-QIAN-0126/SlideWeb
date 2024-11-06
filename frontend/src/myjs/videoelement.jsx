import React from 'react';

function VideoElement({ element, onEdit }) {
  return (
    <iframe
      width="100%"
      height="100%"
      src={`https://www.youtube.com/embed/${element.properties.videoId}?autoplay=${
        element.properties.autoplay ? 1 : 0
      }`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  );
}

export default VideoElement;