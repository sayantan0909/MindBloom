'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Program, Mesh, Sphere } from 'ogl';

interface OrbProps {
    hue?: number;
    hoverIntensity?: number;
    rotateOnHover?: boolean;
    forceHoverState?: boolean;
    backgroundColor?: string;
}

const Orb: React.FC<OrbProps> = ({
    hue = 0,
    hoverIntensity = 0.2,
    rotateOnHover = true,
    forceHoverState = false,
    backgroundColor = 'transparent',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const timeRef = useRef(0);
    const hoverRef = useRef(0);
    const reqRef = useRef<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const renderer = new Renderer({
            alpha: true,
            dpr: Math.min(window.devicePixelRatio, 2),
            preserveDrawingBuffer: false,
        });
        const gl = renderer.gl;
        containerRef.current.appendChild(gl.canvas);
        gl.clearColor(0, 0, 0, 0);

        // Standard Sphere geometry from OGL
        const geometry = new Sphere(gl, { radius: 1, widthSegments: 64, heightSegments: 64 });

        const program = new Program(gl, {
            vertex: `
                attribute vec3 position;
                attribute vec3 normal;
                attribute vec2 uv;
                uniform mat4 modelViewMatrix;
                uniform mat4 projectionMatrix;
                uniform float uTime;
                uniform float uHover;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                // Simple noise
                float hash(float n) { return fract(sin(n) * 43758.5453123); }
                float noise(vec3 x) {
                    vec3 p = floor(x);
                    vec3 f = fract(x);
                    f = f * f * (3.0 - 2.0 * f);
                    float n = p.x + p.y * 57.0 + 113.0 * p.z;
                    return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                                mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                            mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                                mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
                }

                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    float n = noise(vec3(pos * 2.5 + uTime * 0.5));
                    
                    pos += normal * n * (0.1 + uHover * 0.1);

                    vNormal = normal;
                    vPosition = pos;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragment: `
                precision highp float;
                uniform float uHue;
                uniform float uHover;
                uniform float uTime;
                varying vec2 vUv;
                varying vec3 vNormal;
                varying vec3 vPosition;

                vec3 hsl2rgb(vec3 c) {
                    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
                    return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
                }

                void main() {
                    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                    float diff = max(dot(vNormal, lightDir), 0.0);
                    
                    // Base color
                    float h = uHue / 360.0;
                    // Vary hue slightly
                    vec3 col = hsl2rgb(vec3(h, 0.6, 0.6));
                    
                    // Add lighting
                    col *= (0.5 + diff * 0.5);
                    
                    // Add hover glow
                    col += vec3(uHover * 0.3);
                    
                    gl_FragColor = vec4(col, 1.0);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uHue: { value: hue },
                uHover: { value: 0 },
            },
            transparent: true,
            cullFace: null, // show backface if distorted
        });

        const mesh = new Mesh(gl, { geometry, program });

        // Camera
        // Basic perspective config standard for Orb
        // We can manipulate projection directly if Camera is not imported, but OGL Mesh rendering typically needs standard matrices.
        // We'll trust standard OGL behavior where we set up a Camera manually if needed.
        // Actually, let's import Camera!
        const { Camera } = require('ogl');
        const camera = new Camera(gl, { fov: 45 });
        camera.position.z = 5;

        // Resize
        const resize = () => {
            if (!containerRef.current) return;
            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;
            renderer.setSize(width, height);
            camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
        };
        window.addEventListener('resize', resize);
        resize();

        // Animation Loop
        let lastTime = 0;

        const update = (t: number) => {
            reqRef.current = requestAnimationFrame(update);
            const dt = t - lastTime;
            lastTime = t;

            timeRef.current += 0.01;
            program.uniforms.uTime.value = timeRef.current;
            program.uniforms.uHue.value = hue;

            // Lerp hover
            const target = forceHoverState ? 1 : hoverRef.current;
            const current = program.uniforms.uHover.value;
            program.uniforms.uHover.value += (target - current) * 0.1;

            if (rotateOnHover) {
                mesh.rotation.y += 0.005;
            } else {
                mesh.rotation.y += 0.005;
            }

            renderer.render({ scene: mesh, camera });
        };
        reqRef.current = requestAnimationFrame(update);

        // Events
        const handleEnter = () => { hoverRef.current = 1; };
        const handleLeave = () => { hoverRef.current = 0; };
        containerRef.current.addEventListener('mouseenter', handleEnter);
        containerRef.current.addEventListener('mouseleave', handleLeave);

        return () => {
            cancelAnimationFrame(reqRef.current);
            window.removeEventListener('resize', resize);
            if (containerRef.current) {
                containerRef.current.removeEventListener('mouseenter', handleEnter);
                containerRef.current.removeEventListener('mouseleave', handleLeave);
                if (containerRef.current.contains(gl.canvas)) {
                    containerRef.current.removeChild(gl.canvas);
                }
            }
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };

    }, [hue, forceHoverState, rotateOnHover]);

    return (
        <div ref={containerRef} className="w-full h-full" style={{ backgroundColor }} />
    );
};

export default Orb;
