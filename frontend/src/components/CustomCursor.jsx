import React, { useEffect, useState } from 'react';
import '../styles/cursor3d.css';

const CustomCursor = () => {
  const [hovered, setHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Enable visibility on mouse activity
    const handleInitialMove = () => {
      setIsVisible(true);
      window.removeEventListener('mousemove', handleInitialMove);
    };
    window.addEventListener('mousemove', handleInitialMove);

    return () => window.removeEventListener('mousemove', handleInitialMove);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const dot = document.getElementById('custom-cursor-dot');
    const ring = document.getElementById('custom-cursor-ring');

    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Update dot position immediately
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const onMouseLeave = () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    };

    const onMouseEnter = () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    };

    const onMouseOver = (e) => {
      const target = e.target;
      const isClickable =
        target.tagName === 'A' ||
        target.closest('a') ||
        target.tagName === 'BUTTON' ||
        target.closest('button') ||
        target.closest('.filter-tab') ||
        target.closest('.btn') ||
        target.closest('.card-3d') ||
        target.closest('.action-btn') ||
        target.closest('.proj-mini-card') ||
        target.closest('.proj-mini-card') ||
        target.getAttribute('role') === 'button';

      setHovered(!!isClickable);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseover', onMouseOver);

    // Smooth trailing animation loop for the outer ring
    let frameId;
    const updateRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      frameId = requestAnimationFrame(updateRing);
    };
    frameId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseover', onMouseOver);
      cancelAnimationFrame(frameId);
    };
  }, [isVisible]);

  return (
    <>
      <div
        id="custom-cursor-dot"
        className={`custom-cursor-dot ${hovered ? 'hovered' : ''}`}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      <div
        id="custom-cursor-ring"
        className={`custom-cursor-ring ${hovered ? 'hovered' : ''}`}
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </>
  );
};

export default CustomCursor;
