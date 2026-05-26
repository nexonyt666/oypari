import React, { useEffect, useState } from 'react';

const BackgroundSparkles = () => {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    // Generate 25 random sparkles
    const list = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 8 + 3, // 3px to 11px
      delay: `${Math.random() * 5}s`,
      duration: `${12 + Math.random() * 16}s`,
      opacity: Math.random() * 0.35 + 0.1, // very soft glow
    }));
    setSparkles(list);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes floatSparkle {
          0% { transform: translateY(0) rotate(0deg) scale(0.8); opacity: 0; }
          15% { opacity: var(--max-opacity); }
          85% { opacity: var(--max-opacity); }
          100% { transform: translateY(-100px) rotate(120deg) scale(1); opacity: 0; }
        }
      `}</style>

      {sparkles.map(s => (
        <svg
          key={s.id}
          viewBox="0 0 24 24"
          fill="none"
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            color: s.id % 2 === 0 ? '#6366F1' : '#A855F7', // alternating indigo & purple stars
            opacity: 0,
            '--max-opacity': s.opacity,
            animation: `floatSparkle ${s.duration} linear infinite`,
            animationDelay: s.delay,
            willChange: 'transform, opacity',
          }}
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
};

export default BackgroundSparkles;
