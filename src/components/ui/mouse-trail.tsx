'use client';

import React, { useEffect, useRef, useState } from 'react';

const MouseTrail = () => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const lastMoveRef = useRef(Date.now());
  const idleTimeRef = useRef(0);
  const breathPhaseRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Healing color palettes - choose one per session
  const palettes = {
    anxiety: { r: 191, g: 215, b: 255 }, // Soft blue
    lowMood: { r: 214, g: 199, b: 255 }, // Lavender
    sadness: { r: 255, g: 214, b: 201 }, // Warm peach
    tired: { r: 184, g: 181, b: 255 }    // Cool violet
  };

  const [sessionColor] = useState(() => {
    const keys = Object.keys(palettes);
    return palettes[keys[Math.floor(Math.random() * keys.length)]];
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      lastMoveRef.current = Date.now();
      idleTimeRef.current = 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // Particle class
    class Particle {
      constructor(x, y, isIdle = false) {
        this.x = x;
        this.y = y;
        this.size = 3 + Math.random() * 3;
        this.opacity = 0.12 + Math.random() * 0.13;
        this.maxOpacity = this.opacity;
        this.life = 1;
        this.decay = 0.008 + Math.random() * 0.004;
        this.offsetX = (Math.random() - 0.5) * 20;
        this.offsetY = (Math.random() - 0.5) * 20;
        this.isIdle = isIdle;
        this.idleExpand = 0;
      }

      update(isIdle) {
        if (this.isIdle && isIdle) {
          // Gentle expansion when idle
          this.idleExpand += 0.02;
          this.size = (3 + Math.random() * 3) * (1 + Math.sin(this.idleExpand) * 0.3);
          this.opacity = this.maxOpacity * (0.7 + Math.sin(this.idleExpand * 0.5) * 0.3);
        } else {
          this.life -= this.decay;
          this.opacity = this.maxOpacity * this.life;
        }
      }

      draw(ctx, color) {
        const gradient = ctx.createRadialGradient(
          this.x + this.offsetX,
          this.y + this.offsetY,
          0,
          this.x + this.offsetX,
          this.y + this.offsetY,
          this.size * 4
        );

        gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`);
        gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.filter = 'blur(8px)';
        ctx.fillRect(
          this.x + this.offsetX - this.size * 4,
          this.y + this.offsetY - this.size * 4,
          this.size * 8,
          this.size * 8
        );
        ctx.filter = 'none';
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth cursor following with lag
      const ease = 0.12;
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * ease;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * ease;

      // Check if idle
      const timeSinceMove = Date.now() - lastMoveRef.current;
      const isIdle = timeSinceMove > 500;

      if (isIdle) {
        idleTimeRef.current += 0.016;
      }

      // Breathing pulse rhythm (4s inhale, 6s exhale)
      breathPhaseRef.current += 0.01;
      const breathIntensity = Math.sin(breathPhaseRef.current * 0.628) * 0.5 + 0.5;

      // Create new particles (fewer when idle)
      const shouldSpawn = Math.random() < (isIdle ? 0.15 : 0.35);
      if (shouldSpawn && particlesRef.current.length < (isIdle ? 8 : 12)) {
        particlesRef.current.push(
          new Particle(mouseRef.current.x, mouseRef.current.y, isIdle)
        );
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.update(isIdle);

        if (particle.life > 0 || particle.isIdle) {
          // Apply breathing effect to particle properties
          const breathSize = particle.size * (1 + breathIntensity * 0.15);
          const originalSize = particle.size;
          particle.size = breathSize;
          particle.draw(ctx, sessionColor);
          particle.size = originalSize;
          return true;
        }
        return false;
      });

      // Draw main aura glow
      const mainGradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        40 + (isIdle ? idleTimeRef.current * 10 : 0)
      );

      const mainOpacity = (0.08 + breathIntensity * 0.04) * (isIdle ? 0.7 : 1);
      mainGradient.addColorStop(0, `rgba(${sessionColor.r}, ${sessionColor.g}, ${sessionColor.b}, ${mainOpacity})`);
      mainGradient.addColorStop(0.6, `rgba(${sessionColor.r}, ${sessionColor.g}, ${sessionColor.b}, ${mainOpacity * 0.3})`);
      mainGradient.addColorStop(1, `rgba(${sessionColor.r}, ${sessionColor.g}, ${sessionColor.b}, 0)`);

      ctx.fillStyle = mainGradient;
      ctx.filter = 'blur(20px)';
      const auraSize = 80 + (isIdle ? Math.min(idleTimeRef.current * 20, 60) : 0);
      ctx.fillRect(
        mouseRef.current.x - auraSize,
        mouseRef.current.y - auraSize,
        auraSize * 2,
        auraSize * 2
      );
      ctx.filter = 'none';

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sessionColor]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      <div className="absolute bottom-8 left-8 text-sm opacity-40 text-gray-400">
        Move slowly. Breathe. You are allowed to be here.
      </div>
    </div>
  );
};

export default MouseTrail;