'use client';

import { useEffect, useRef } from 'react';

// Shader sources for fluid simulation
// Standard references from simple-fluid-sim

const baseVertex = `
    attribute vec2 p;
    varying vec2 uv;
    void main() {
        uv = p * 0.5 + 0.5;
        gl_Position = vec4(p, 0.0, 1.0);
    }
`;

const clearShader = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D uTexture;
    uniform float value;
    void main() {
        gl_FragColor = value * texture2D(uTexture, uv);
    }
`;

const splatShader = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main() {
        vec2 p = uv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, uv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`;

const advectionShader = `
    precision highp float;
    varying vec2 uv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main() {
        vec2 coord = uv - dt * texture2D(uVelocity, uv).xy * texelSize;
        gl_FragColor = dissipation * texture2D(uSource, coord);
        gl_FragColor.a = 1.0;
    }
`;

const divergenceShader = `
    precision highp float;
    varying vec2 uv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    void main() {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, uv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`;

const curlShader = `
    precision highp float;
    varying vec2 uv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    void main() {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`;

const vorticityShader = `
    precision highp float;
    varying vec2 uv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main() {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, uv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 vel = texture2D(uVelocity, uv).xy;
        gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
    }
`;

const pressureShader = `
    precision highp float;
    varying vec2 uv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, uv).x;
        float divergence = texture2D(uDivergence, uv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`;

const gradientSubtractShader = `
    precision highp float;
    varying vec2 uv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main() {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, uv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`;

// Helper class for WebGL boilerplate
class GLProgram {
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    uniforms: { [key: string]: WebGLUniformLocation | null };

    constructor(gl: WebGLRenderingContext, vertexSource: string, fragmentSource: string) {
        this.gl = gl;
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentSource);
        this.program = this.createProgram(vertexShader, fragmentShader);
        this.uniforms = this.getUniforms(this.program);
    }

    createShader(type: number, source: string) {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(this.gl.getShaderInfoLog(shader));
            throw new Error('Shader compile error');
        }
        return shader;
    }

    createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
        const program = this.gl.createProgram()!;
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error(this.gl.getProgramInfoLog(program));
            throw new Error('Program link error');
        }
        return program;
    }

    getUniforms(program: WebGLProgram) {
        let uniforms: any = {};
        let uniformCount = this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            let uniformName = this.gl.getActiveUniform(program, i)!.name;
            uniforms[uniformName] = this.gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    bind() {
        this.gl.useProgram(this.program);
    }
}

interface SplashCursorProps {
    SIM_RESOLUTION?: number;
    DYE_RESOLUTION?: number;
    DENSITY_DISSIPATION?: number;
    VELOCITY_DISSIPATION?: number;
    PRESSURE?: number;
    PRESSURE_ITERATIONS?: number;
    CURL?: number;
    SPLAT_RADIUS?: number;
    SPLAT_FORCE?: number;
    SHADING?: boolean;
    COLOR_UPDATE_SPEED?: number;
    BACK_COLOR?: { r: number; g: number; b: number };
    TRANSPARENT?: boolean;
}

const SplashCursor: React.FC<SplashCursorProps> = ({
    SIM_RESOLUTION = 128,
    DYE_RESOLUTION = 512,
    DENSITY_DISSIPATION = 0.97,
    VELOCITY_DISSIPATION = 0.98,
    PRESSURE = 0.8,
    PRESSURE_ITERATIONS = 20,
    CURL = 30,
    SPLAT_RADIUS = 0.25,
    SPLAT_FORCE = 6000,
    SHADING = true,
    COLOR_UPDATE_SPEED = 10,
    BACK_COLOR = { r: 0, g: 0, b: 0 },
    TRANSPARENT = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const gl = canvas.getContext('webgl', {
            alpha: TRANSPARENT,
            depth: false,
            antialias: false,
            preserveDrawingBuffer: false
        }) as WebGLRenderingContext;

        if (!gl) return;

        let ext = gl.getExtension('OES_texture_half_float');
        // Fallback or error check could be here
        // Usually need check for linear filtering extension too
        gl.getExtension('OES_texture_half_float_linear');

        // State variables
        let pointer = { x: 0, y: 0, dx: 0, dy: 0, moved: false };
        let color = { r: Math.random(), g: Math.random(), b: Math.random() };

        // Helper to create FBOs
        function createDoubleFBO(w: number, h: number, internalFormat: any, format: any, type: any, param: any) {
            let fbo1 = createFBO(w, h, internalFormat, format, type, param);
            let fbo2 = createFBO(w, h, internalFormat, format, type, param);
            return {
                get read() { return fbo1; },
                get write() { return fbo2; },
                swap() { let temp = fbo1; fbo1 = fbo2; fbo2 = temp; }
            };
        }

        function createFBO(w: number, h: number, internalFormat: any, format: any, type: any, param: any) {
            gl.activeTexture(gl.TEXTURE0);
            let texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

            let fbo = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            gl.viewport(0, 0, w, h);
            gl.clear(gl.COLOR_BUFFER_BIT);

            return {
                texture,
                fbo,
                width: w,
                height: h,
                attach(id: number) {
                    gl.activeTexture(gl.TEXTURE0 + id);
                    gl.bindTexture(gl.TEXTURE_2D, texture);
                    return id;
                }
            };
        }

        // Initialize FBOs
        // Usually use HALF_FLOAT for better precision than BYTE but check support
        // For brevity assuming HALF_FLOAT support (typical in modern browsers)
        const texType = ext ? ext.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
        const rgba = gl.RGBA;
        const filtering = gl.LINEAR; // Might need NEAREST if extension missing

        let density = createDoubleFBO(DYE_RESOLUTION, DYE_RESOLUTION, rgba, rgba, texType, filtering);
        let velocity = createDoubleFBO(SIM_RESOLUTION, SIM_RESOLUTION, rgba, rgba, texType, filtering);
        let divergence = createFBO(SIM_RESOLUTION, SIM_RESOLUTION, rgba, rgba, texType, filtering);
        let curl = createFBO(SIM_RESOLUTION, SIM_RESOLUTION, rgba, rgba, texType, filtering);
        let pressure = createDoubleFBO(SIM_RESOLUTION, SIM_RESOLUTION, rgba, rgba, texType, filtering);

        // Programs
        const copyProgram = new GLProgram(gl, baseVertex, clearShader); // Reusing clear shader as copy
        const splatProgram = new GLProgram(gl, baseVertex, splatShader);
        const curlProgram = new GLProgram(gl, baseVertex, curlShader);
        const vorticityProgram = new GLProgram(gl, baseVertex, vorticityShader);
        const divergenceProgram = new GLProgram(gl, baseVertex, divergenceShader);
        const pressureProgram = new GLProgram(gl, baseVertex, pressureShader);
        const gradSubtractProgram = new GLProgram(gl, baseVertex, gradientSubtractShader);
        const advectionProgram = new GLProgram(gl, baseVertex, advectionShader);
        const clearProgram = new GLProgram(gl, baseVertex, clearShader);

        // Display shader
        const displayShaderSource = `
            precision highp float;
            varying vec2 uv;
            uniform sampler2D uTexture;
            uniform vec3 backColor;
            uniform float transparent;
            void main() {
                vec3 c = texture2D(uTexture, uv).rgb;
                float a = max(c.r, max(c.g, c.b));
                if (transparent > 0.5) {
                    gl_FragColor = vec4(c, a);
                } else {
                    gl_FragColor = vec4(mix(backColor, c, a), 1.0);
                }
            }
        `;
        const displayProgram = new GLProgram(gl, baseVertex, displayShaderSource);

        // Quad buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(0);

        let lastTime = Date.now();
        let animationId: number;

        function update() {
            animationId = requestAnimationFrame(update);
            const dt = Math.min((Date.now() - lastTime) / 1000, 0.016);
            lastTime = Date.now();

            gl.viewport(0, 0, SIM_RESOLUTION, SIM_RESOLUTION);

            // Curl
            curlProgram.bind();
            gl.uniform2f(curlProgram.uniforms.texelSize, 1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION);
            gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
            blit(curl.fbo);

            // Vorticity
            vorticityProgram.bind();
            gl.uniform2f(vorticityProgram.uniforms.texelSize, 1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION);
            gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
            gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
            gl.uniform1f(vorticityProgram.uniforms.curl, CURL);
            gl.uniform1f(vorticityProgram.uniforms.dt, dt);
            blit(velocity.write.fbo);
            velocity.swap();

            // Divergence
            divergenceProgram.bind();
            gl.uniform2f(divergenceProgram.uniforms.texelSize, 1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION);
            gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
            blit(divergence.fbo);

            // Clear Pressure
            clearProgram.bind();
            gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
            gl.uniform1f(clearProgram.uniforms.value, PRESSURE);
            blit(pressure.write.fbo);
            pressure.swap();

            // Pressure (Jacobi)
            pressureProgram.bind();
            gl.uniform2f(pressureProgram.uniforms.texelSize, 1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION);
            gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
            for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
                gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
                blit(pressure.write.fbo);
                pressure.swap();
            }

            // Gradient Subtract
            gradSubtractProgram.bind();
            gl.uniform2f(gradSubtractProgram.uniforms.texelSize, 1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION);
            gl.uniform1i(gradSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
            gl.uniform1i(gradSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
            blit(velocity.write.fbo);
            velocity.swap();

            // Advection (Velocity)
            advectionProgram.bind();
            gl.uniform2f(advectionProgram.uniforms.texelSize, 1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION);
            if (!ext) gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, 1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION);
            gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
            gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
            gl.uniform1f(advectionProgram.uniforms.dt, dt);
            gl.uniform1f(advectionProgram.uniforms.dissipation, VELOCITY_DISSIPATION);
            blit(velocity.write.fbo);
            velocity.swap();

            // Advection (Dye)
            gl.viewport(0, 0, DYE_RESOLUTION, DYE_RESOLUTION);
            advectionProgram.bind();
            gl.uniform2f(advectionProgram.uniforms.texelSize, 1.0 / SIM_RESOLUTION, 1.0 / SIM_RESOLUTION);
            gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
            gl.uniform1i(advectionProgram.uniforms.uSource, density.read.attach(1));
            gl.uniform1f(advectionProgram.uniforms.dt, dt);
            gl.uniform1f(advectionProgram.uniforms.dissipation, DENSITY_DISSIPATION);
            blit(density.write.fbo);
            density.swap();

            // Splat
            if (pointer.moved) {
                pointer.moved = false;
                splatProgram.bind();
                gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
                gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
                // Correct pointer coordinates for aspect and scale
                // Simplified for brevity - assumes full screen canvas
                gl.uniform2f(splatProgram.uniforms.point, pointer.x / canvas.width, 1.0 - pointer.y / canvas.height);
                gl.uniform3f(splatProgram.uniforms.color, pointer.dx, -pointer.dy, 1.0); // velocity splat
                gl.uniform1f(splatProgram.uniforms.radius, SPLAT_RADIUS / 100.0);
                blit(velocity.write.fbo);
                velocity.swap();

                gl.uniform1i(splatProgram.uniforms.uTarget, density.read.attach(0));
                gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b); // dye splat
                blit(density.write.fbo);
                density.swap();
            }

            // Display
            gl.viewport(0, 0, canvas.width, canvas.height);
            displayProgram.bind();
            gl.uniform1i(displayProgram.uniforms.uTexture, density.read.attach(0));
            gl.uniform3f(displayProgram.uniforms.backColor, BACK_COLOR.r, BACK_COLOR.g, BACK_COLOR.b);
            gl.uniform1f(displayProgram.uniforms.transparent, TRANSPARENT ? 1.0 : 0.0);
            blit(null);
        }

        function blit(fbo: WebGLFramebuffer | null) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
            gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
        }

        // Pointer Handling
        const handleMove = (e: MouseEvent) => {
            const x = e.clientX;
            const y = e.clientY;
            pointer.dx = (x - pointer.x) * SPLAT_FORCE;
            pointer.dy = (y - pointer.y) * SPLAT_FORCE;
            pointer.x = x;
            pointer.y = y;
            pointer.moved = true;

            // Random color
            color.r = Math.sin(Date.now() * 0.001 * COLOR_UPDATE_SPEED + 0) * 0.5 + 0.5;
            color.g = Math.sin(Date.now() * 0.001 * COLOR_UPDATE_SPEED + 2) * 0.5 + 0.5;
            color.b = Math.sin(Date.now() * 0.001 * COLOR_UPDATE_SPEED + 4) * 0.5 + 0.5;
        };

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('resize', resize);
        resize();
        update();

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('resize', resize);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };

    }, [SIM_RESOLUTION, DYE_RESOLUTION, DENSITY_DISSIPATION, VELOCITY_DISSIPATION, PRESSURE, CURL, SPLAT_RADIUS, SPLAT_FORCE, SHADING, COLOR_UPDATE_SPEED, BACK_COLOR, TRANSPARENT]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 z-50 pointer-events-none w-full h-full"
        />
    );
};

export default SplashCursor;
