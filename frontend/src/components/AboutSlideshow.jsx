
import React, { useState, useEffect } from 'react';

const AboutSlideshow = ({ images, slideDuration = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, slideDuration);
    return () => clearInterval(interval);
  }, [images.length, slideDuration]);

  return (
    <div style={{
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      backgroundColor: '#0000', // Light grey background
      padding: '60px 0', // Vertical padding for the grey area
      marginBottom: '80px' // Space before footer
    }}>
      <div style={{
        maxWidth: '1800px', // Constrain content width
        margin: '0 auto', // Center content
        padding: '0 20px' // Side padding
      }}>
        <div style={{ 
          position: 'relative', 
          height: '400px',
          margin: '0 auto'
        }}>
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Slide ${index + 1}`}
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                height: '100%',
                width: 'auto',
                maxWidth: '100%',
                objectFit: 'contain',
                opacity: index === currentIndex ? 1 : 0,
                transition: 'opacity 1.5s ease-in-out'
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutSlideshow;