'use client';

import Orb from '@/components/Orb';
import SpotlightCard from '@/components/SpotlightCard';
import SplashCursor from '@/components/SplashCursor';
import BlurText from '@/components/BlurText';

export default function DemoPage() {
    return (
        <div className="relative min-h-screen w-full text-white overflow-hidden">
            {/* 1. Fluid Cursor Overlay */}
            <SplashCursor />

            {/* 2. Background Orb */}
            <div className="absolute top-0 left-0 w-full h-full z-0 opacity-50">
                <Orb
                    hue={200}
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    forceHoverState={false}
                    backgroundColor="transparent"
                />
            </div>

            {/* Content Layer */}
            <div className="relative z-10 p-12 w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen gap-12 pointer-events-none">
                {/* 3. Animated Text */}
                <div className="text-center space-y-4 pointer-events-auto">
                    <BlurText
                        text="Visual Components Demo"
                        className="text-6xl font-bold text-transparent bg-clip-text from-cyan-400 to-purple-500"
                        delay={0.2}
                        direction="top"
                    />
                    <BlurText
                        text="Interactive UI Elements for Next.js"
                        className="text-2xl text-neutral-400"
                        delay={0.6}
                        animateBy="words"
                        direction="bottom"
                    />
                </div>

                {/* 4. Spotlight Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full pointer-events-auto">
                    <SpotlightCard className="h-64 p-8 flex flex-col justify-end" spotlightColor="rgba(0, 255, 255, 0.2)">
                        <h3 className="text-2xl font-bold mb-2">Components</h3>
                        <p className="text-neutral-400">
                            Modular and reusable WebGL components powered by OGL.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="h-64 p-8 flex flex-col justify-end" spotlightColor="rgba(255, 0, 255, 0.2)">
                        <h3 className="text-2xl font-bold mb-2">Interactions</h3>
                        <p className="text-neutral-400">
                            Mouse-aware effects like spotlight and fluid simulations.
                        </p>
                    </SpotlightCard>

                    <SpotlightCard className="h-64 p-8 flex flex-col justify-end" spotlightColor="rgba(255, 255, 0, 0.2)">
                        <h3 className="text-2xl font-bold mb-2">Performance</h3>
                        <p className="text-neutral-400">
                            Optimized for 60fps with lightweight shaders and React refs.
                        </p>
                    </SpotlightCard>
                </div>
            </div>
        </div>
    );
}
