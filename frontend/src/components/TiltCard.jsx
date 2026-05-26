import React from 'react';
import useMouseTilt from '../hooks/useMouseTilt';
import '../styles/effects3d.css';

const TiltCard = ({
  children,
  maxTilt = 10,
  scale = 1.02,
  speed = 400,
  className = '',
  style = {},
  onClick,
  onMouseOver,
  onMouseOut,
  ...props
}) => {
  const tiltRef = useMouseTilt(maxTilt, scale, speed);

  // Combine parent mouse events with tilt container
  const handleMouseOver = (e) => {
    if (onMouseOver) onMouseOver(e);
  };

  const handleMouseOut = (e) => {
    if (onMouseOut) onMouseOut(e);
  };

  return (
    <div
      ref={tiltRef}
      className={`card-3d ${className}`}
      style={{
        transformStyle: 'preserve-3d',
        ...style,
      }}
      onClick={onClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...props}
    >
      <div className="card-3d-inner" style={{ transformStyle: 'preserve-3d', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
        <div className="card-3d-shine" />
      </div>
    </div>
  );
};

export default TiltCard;
