import { useEffect, useRef } from 'react';

/**
 * ParticleCanvas — 3D rotating star/dot field
 * Renders ~200 particles in 3D space, slowly auto-rotates,
 * and reacts to mouse position for parallax depth.
 */
const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ── Setup ──────────────────────────────────────────
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const PARTICLE_COUNT = 180;
    const DEPTH_RANGE = 1000;
    const FOCAL = 600; // focal length for 3D projection

    // ── Create particles in 3D space ───────────────────
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * DEPTH_RANGE,
      baseZ: 0,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.6
        ? `hsl(${240 + Math.random() * 30}, 70%, ${60 + Math.random() * 30}%)`  // blue/purple
        : `hsl(${320 + Math.random() * 20}, 70%, ${60 + Math.random() * 30}%)`, // pink
      opacity: Math.random() * 0.6 + 0.2,
    }));

    // Each particle also stores initial z for drift
    particles.forEach(p => { p.baseZ = p.z; });

    let time = 0;
    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    // ── Mouse influence ────────────────────────────────
    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      targetRotX = ((e.clientY / H) - 0.5) * 0.4;
      targetRotY = ((e.clientX / W) - 0.5) * 0.4;
    };

    const onResize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    // ── 3D → 2D projection ─────────────────────────────
    const project = (x, y, z) => {
      const scale = FOCAL / (FOCAL + z);
      return {
        sx: W / 2 + x * scale,
        sy: H / 2 + y * scale,
        scale,
      };
    };

    // ── 3D rotation matrices ───────────────────────────
    const rotatePoint = (x, y, z, rx, ry) => {
      // Rotate around Y axis
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = x * cosY - z * sinY;
      const z1 = x * sinY + z * cosY;

      // Rotate around X axis
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y1 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      return { x: x1, y: y1, z: z2 };
    };

    // ── Animation loop ─────────────────────────────────
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      time += 0.003;

      // Smoothly interpolate rotation towards mouse target
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;
      // Add slow auto-rotation
      const autoRotY = time * 0.08;
      const autoRotX = Math.sin(time * 0.3) * 0.05;

      // Sort by Z depth (painter's algorithm)
      const projected = particles.map((p, i) => {
        // Move particle through z-axis (drift towards viewer)
        p.z -= p.speed;
        if (p.z < 1) p.z = DEPTH_RANGE;

        // Apply rotation
        const rotated = rotatePoint(p.x, p.y, p.z - DEPTH_RANGE / 2, rotX + autoRotX, rotY + autoRotY);
        const { sx, sy, scale } = project(rotated.x, rotated.y, rotated.z + DEPTH_RANGE / 2);

        return { ...p, sx, sy, scale, depth: rotated.z + DEPTH_RANGE / 2 };
      }).sort((a, b) => b.depth - a.depth);

      // Draw connections between nearby particles
      projected.forEach((p, i) => {
        for (let j = i + 1; j < Math.min(i + 6, projected.length); j++) {
          const q = projected[j];
          const dx = p.sx - q.sx;
          const dy = p.sy - q.sy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const avgDepth = (p.depth + q.depth) / (2 * DEPTH_RANGE);
            const alpha = (1 - dist / 100) * (1 - avgDepth) * 0.25;
            if (alpha > 0.01) {
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(q.sx, q.sy);
              ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
      });

      // Draw particles
      projected.forEach((p) => {
        if (p.sx < -50 || p.sx > W + 50 || p.sy < -50 || p.sy > H + 50) return;

        const depthAlpha = 1 - p.depth / DEPTH_RANGE;
        const alpha = p.opacity * depthAlpha;
        const radius = p.size * p.scale * 1.5;

        if (radius < 0.2) return;

        // Glow effect
        const gradient = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, radius * 3);
        gradient.addColorStop(0, p.color.replace('hsl', 'hsla').replace(')', `, ${alpha})`));
        gradient.addColorStop(0.4, p.color.replace('hsl', 'hsla').replace(')', `, ${alpha * 0.4})`));
        gradient.addColorStop(1, p.color.replace('hsl', 'hsla').replace(')', ', 0)'));

        ctx.beginPath();
        ctx.arc(p.sx, p.sy, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, Math.max(0.5, radius), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace('hsl', 'hsla').replace(')', `, ${alpha})`);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.65,
      }}
    />
  );
};

export default ParticleCanvas;
