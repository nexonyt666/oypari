import { useEffect, useRef, useCallback } from 'react';

/**
 * useMouseTilt — 3D tilt effect that follows mouse cursor
 * @param {number} maxTilt - max degrees to tilt (default 15)
 * @param {number} scale   - scale on hover (default 1.04)
 * @param {number} speed   - transition speed ms (default 400)
 */
const useMouseTilt = (maxTilt = 15, scale = 1.04, speed = 400) => {
  const ref = useRef(null);
  const frameRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);

    frameRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Normalize to -1 to 1
      const dx = (e.clientX - centerX) / (rect.width / 2);
      const dy = (e.clientY - centerY) / (rect.height / 2);

      // Clamp
      const clampedX = Math.max(-1, Math.min(1, dx));
      const clampedY = Math.max(-1, Math.min(1, dy));

      const rotateY = clampedX * maxTilt;
      const rotateX = -clampedY * maxTilt;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      el.style.transition = `transform 0.1s ease-out`;
    });
  }, [maxTilt, scale]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    el.style.transition = `transform ${speed}ms cubic-bezier(0.23, 1, 0.32, 1)`;
  }, [speed]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return ref;
};

export default useMouseTilt;
