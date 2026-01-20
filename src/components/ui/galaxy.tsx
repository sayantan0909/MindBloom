'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface GalaxyProps {
    className?: string;
    starSpeed?: number;
    density?: number;
    hueShift?: number;
    glowIntensity?: number;
    saturation?: number;
    mouseRepulsion?: boolean;
    repulsionStrength?: number;
    twinkleIntensity?: number;
}

export function Galaxy({
    className,
    starSpeed = 0.5,
    density = 1,
    hueShift = 140,
    glowIntensity = 0.3,
    saturation = 0.8,
    mouseRepulsion = true,
    repulsionStrength = 2,
    twinkleIntensity = 0.3,
}: GalaxyProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let mouseX = 0;
        let mouseY = 0;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        // Star class
        class Star {
            x: number;
            y: number;
            z: number;
            size: number;
            baseX: number;
            baseY: number;
            twinkle: number;
            twinkleSpeed: number;

            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 2000;
                this.size = Math.random() * 2;
                this.baseX = this.x;
                this.baseY = this.y;
                this.twinkle = Math.random() * Math.PI * 2;
                this.twinkleSpeed = 0.02 + Math.random() * 0.03;
            }

            update() {
                this.z -= starSpeed;
                if (this.z <= 0) {
                    this.z = 2000;
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.baseX = this.x;
                    this.baseY = this.y;
                }

                // Mouse repulsion
                if (mouseRepulsion) {
                    const dx = this.baseX - mouseX;
                    const dy = this.baseY - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const force = (repulsionStrength * 100) / (distance + 1);

                    this.x = this.baseX + (dx / distance) * force;
                    this.y = this.baseY + (dy / distance) * force;
                }

                // Twinkle
                this.twinkle += this.twinkleSpeed;
            }

            draw() {
                const scale = 1000 / (1000 + this.z);
                const x2d = (this.x - canvas.width / 2) * scale + canvas.width / 2;
                const y2d = (this.y - canvas.height / 2) * scale + canvas.height / 2;

                if (x2d < 0 || x2d > canvas.width || y2d < 0 || y2d > canvas.height) {
                    return;
                }

                const size = this.size * scale;
                const brightness = 1 - this.z / 2000;
                const twinkleBrightness = Math.sin(this.twinkle) * twinkleIntensity + (1 - twinkleIntensity);
                const alpha = brightness * twinkleBrightness;

                // Color based on hue shift
                const hue = (hueShift + (this.z / 2000) * 60) % 360;

                ctx.fillStyle = `hsla(${hue}, ${saturation * 100}%, ${50 + brightness * 50}%, ${alpha})`;
                ctx.shadowBlur = glowIntensity * 10;
                ctx.shadowColor = `hsl(${hue}, ${saturation * 100}%, 70%)`;

                ctx.beginPath();
                ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Create stars
        const starCount = Math.floor((canvas.width * canvas.height) / 10000 * density);
        const stars: Star[] = [];
        for (let i = 0; i < starCount; i++) {
            stars.push(new Star());
        }

        // Animation loop
        const animate = () => {
            ctx.fillStyle = 'rgba(10, 5, 18, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.update();
                star.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // Mouse tracking
        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };
        if (mouseRepulsion) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [starSpeed, density, hueShift, glowIntensity, saturation, mouseRepulsion, repulsionStrength, twinkleIntensity]);

    return (
        <>
            <canvas
                ref={canvasRef}
                className={cn('fixed inset-0 -z-10', className)}
            />
            {/* Gradient overlay for text readability */}
            <div className="fixed inset-0 -z-10 bg-gradient-to-b from-black/50 via-transparent to-black/80 pointer-events-none" />
        </>
    );
}
