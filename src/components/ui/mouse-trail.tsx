'use client';

import { useEffect } from 'react';
import { useMouseTrail } from '@/hooks/use-mouse-trail';

const DOT_COUNT = 15;
const FADE_OUT_SPEED = 0.05;
const INACTIVITY_TIMEOUT = 3000;

export function MouseTrail() {
  const { isEnabled } = useMouseTrail();

  useEffect(() => {
    if (typeof window === 'undefined' || !isEnabled) {
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    let animationFrameId: number;
    let inactivityTimer: NodeJS.Timeout;
    let currentIntensity = 1;

    const dots: { x: number; y: number; alpha: number; scale: number }[] = [];
    const mouse = { x: -100, y: -100 };
    let themeColor = 'hsla(var(--primary), 0.7)';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const updateThemeColor = () => {
        const style = getComputedStyle(document.body);
        const primaryHsl = style.getPropertyValue('--primary').trim();
        if (primaryHsl) {
            themeColor = `hsla(${primaryHsl}, 0.7)`;
        }
    };
    
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({ x: mouse.x, y: mouse.y, alpha: 1, scale: 1 });
    }
    
    const handleMouseMove = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        currentIntensity = 1;
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            currentIntensity = 0.3;
        }, INACTIVITY_TIMEOUT);
    };

    const draw = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      dots.forEach((dot, index) => {
        const nextDot = dots[index + 1] || dots[0];

        dot.x += (mouse.x - dot.x) * 0.5;
        dot.y += (mouse.y - dot.y) * 0.5;
        dot.alpha -= FADE_OUT_SPEED;
        if(dot.alpha < 0) dot.alpha = 0;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2 * dot.scale, 0, 2 * Math.PI);
        ctx.fillStyle = themeColor.replace(/, 0.7\)/, `, ${dot.alpha * currentIntensity})`);
        ctx.fill();
        
        dot.scale = (index / DOT_COUNT);
      });
      
      dots[0].x = mouse.x;
      dots[0].y = mouse.y;
      dots[0].alpha = 1;

      animationFrameId = requestAnimationFrame(draw);
    };

    const isTouchDevice = 'ontouchstart' in window;
    if (!isTouchDevice) {
        resizeCanvas();
        updateThemeColor();
        window.addEventListener('resize', resizeCanvas);
        document.addEventListener('mousemove', handleMouseMove);

        const observer = new MutationObserver((mutations) => {
            if (mutations.some(m => m.attributeName === 'class')) {
                updateThemeColor();
            }
        });
        observer.observe(document.documentElement, { attributes: true });

        draw();
    }
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      if(document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, [isEnabled]);

  return null;
}
