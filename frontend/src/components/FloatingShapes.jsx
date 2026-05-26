import React, { useEffect, useRef } from 'react';

/**
 * FloatingShapes — CSS 3D animated geometric shapes
 * Creates floating cubes, rings, and pyramids that orbit in 3D space
 */

const Shape = ({ type, style, delay = 0, duration = 12 }) => {
  const shapes = {
    cube: (
      <div className="shape-3d-cube" style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s`, ...style }}>
        <div className="face front" />
        <div className="face back" />
        <div className="face left" />
        <div className="face right" />
        <div className="face top" />
        <div className="face bottom" />
      </div>
    ),
    ring: (
      <div className="shape-3d-ring" style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s`, ...style }} />
    ),
    pyramid: (
      <div className="shape-3d-pyramid" style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s`, ...style }}>
        <div className="tri-face" />
        <div className="tri-face" />
        <div className="tri-face" />
        <div className="tri-face" />
      </div>
    ),
    diamond: (
      <div className="shape-3d-diamond" style={{ animationDelay: `${delay}s`, animationDuration: `${duration}s`, ...style }} />
    ),
  };
  return shapes[type] || null;
};

const FloatingShapes = () => (
  <div className="floating-shapes-container" aria-hidden="true">
    {/* Cubes */}
    <Shape type="cube" delay={0}  duration={20} style={{ top: '15%', left: '8%',  '--size': '40px', '--color': 'rgba(99,102,241,0.15)' }} />
    <Shape type="cube" delay={3}  duration={25} style={{ top: '65%', left: '5%',  '--size': '28px', '--color': 'rgba(168,85,247,0.12)' }} />
    <Shape type="cube" delay={6}  duration={18} style={{ top: '35%', right: '7%', '--size': '50px', '--color': 'rgba(236,72,153,0.1)' }} />
    <Shape type="cube" delay={9}  duration={22} style={{ top: '75%', right: '4%', '--size': '32px', '--color': 'rgba(99,102,241,0.1)' }} />

    {/* Rings */}
    <Shape type="ring" delay={2}  duration={15} style={{ top: '25%', left: '3%',  '--size': '80px',  '--color': 'rgba(168,85,247,0.15)' }} />
    <Shape type="ring" delay={5}  duration={18} style={{ top: '55%', right: '3%', '--size': '60px',  '--color': 'rgba(99,102,241,0.12)' }} />
    <Shape type="ring" delay={8}  duration={22} style={{ top: '82%', left: '12%', '--size': '100px', '--color': 'rgba(236,72,153,0.1)' }} />

    {/* Diamonds */}
    <Shape type="diamond" delay={1}  duration={14} style={{ top: '10%', right: '12%', '--size': '20px', '--color': 'rgba(99,102,241,0.2)' }} />
    <Shape type="diamond" delay={4}  duration={17} style={{ top: '45%', left: '2%',  '--size': '16px', '--color': 'rgba(236,72,153,0.18)' }} />
    <Shape type="diamond" delay={7}  duration={20} style={{ top: '70%', right: '8%', '--size': '24px', '--color': 'rgba(168,85,247,0.15)' }} />
  </div>
);

export default FloatingShapes;
