import React, { useEffect, useRef } from 'react';

export const CanvasBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // High performance space telemetry nodes
    const nodeCount = Math.min(Math.floor(window.innerWidth / 30), 40);
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.4 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.4 + 0.15,
      pulse: Math.random() * Math.PI,
      isPulsing: Math.random() > 0.7
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Subtle tech constellation web
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const lineAlpha = (1 - dist / 140) * 0.12;
            ctx.strokeStyle = `rgba(6, 182, 212, ${lineAlpha})`;
            ctx.lineWidth = 0.65;
            ctx.stroke();
          }
        }
      }

      // Render nodes
      nodes.forEach((n) => {
        n.pulse += 0.02;
        const currentAlpha = n.isPulsing ? n.alpha + Math.sin(n.pulse) * 0.15 : n.alpha;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${Math.max(0.05, currentAlpha)})`;
        ctx.fill();

        if (!prefersReducedMotion) {
          n.x += n.vx;
          n.y += n.vy;

          if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
          if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        }
      });

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-45"
    />
  );
};
