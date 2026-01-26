"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface BreathingGuideProps {
    phase: 'in' | 'out';
}

export function BreathingGuide({ phase }: BreathingGuideProps) {
    return (
        <div className="mb-8 text-center flex flex-col items-center">
            <motion.div
                className="text-2xl text-[#37474f] font-light tracking-wide h-8"
                animate={{
                    scale: phase === 'in' ? 1.1 : 0.95,
                    opacity: phase === 'in' ? 1 : 0.7
                }}
                transition={{
                    duration: phase === 'in' ? 3 : 4,
                    ease: "easeInOut"
                }}
            >
                {phase === 'in' ? 'Breathe in...' : 'Breathe out...'}
            </motion.div>

            <div className="mt-4 h-1.5 w-48 bg-[#a5d6a7]/30 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
                <motion.div
                    className="h-full bg-gradient-to-r from-[#66bb6a] to-[#81c784]"
                    initial={{ width: "0%" }}
                    animate={{
                        width: phase === 'in' ? "100%" : "0%"
                    }}
                    transition={{
                        duration: phase === 'in' ? 3 : 4,
                        ease: "linear"
                    }}
                />
            </div>

            <div className="mt-8 relative flex items-center justify-center">
                {/* Breathing Circle */}
                <motion.div
                    className="absolute w-16 h-16 rounded-full bg-[#66bb6a]/10 border border-[#66bb6a]/20"
                    animate={{
                        scale: phase === 'in' ? [1, 2.5] : [2.5, 1],
                        opacity: phase === 'in' ? [0.2, 0.5] : [0.5, 0.2]
                    }}
                    transition={{
                        duration: phase === 'in' ? 3 : 4,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="w-4 h-4 rounded-full bg-[#66bb6a]/40"
                    animate={{
                        scale: phase === 'in' ? [1, 1.2, 1] : [1, 1],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity
                    }}
                />
            </div>
        </div>
    );
}
