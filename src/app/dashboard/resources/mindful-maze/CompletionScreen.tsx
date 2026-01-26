"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface CompletionScreenProps {
    onRetry: () => void;
}

export function CompletionScreen({ onRetry }: CompletionScreenProps) {
    const router = useRouter();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#f1f8f4]/95 backdrop-blur-md p-4"
        >
            <div className="relative text-center max-w-2xl bg-white/50 p-8 sm:p-12 rounded-[40px] shadow-2xl border border-white/60">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <div className="text-6xl mb-6">🌟</div>
                    <h2 className="text-4xl font-light text-[#37474f] mb-4">You stayed present</h2>
                    <p className="text-xl text-[#546e7a] font-light mb-8 max-w-md mx-auto leading-relaxed">
                        In a world of constant rush, you found peace in the journey. Every step was progress.
                    </p>
                </motion.div>

                {/* Breathing circle animation */}
                <div className="flex justify-center mb-10">
                    <motion.div
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-[#66bb6a] to-[#ffd54f] blur-sm"
                        animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.6, 0.8, 0.6]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>

                <div className="space-y-6 mb-10">
                    <p className="text-lg text-[#37474f] font-light italic">
                        "Take a deep breath. Notice how you feel right now."
                    </p>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#a5d6a7] to-transparent mx-auto" />
                    <p className="text-base text-[#78909c] leading-relaxed">
                        What was one small thing you noticed during your journey?
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button
                        onClick={onRetry}
                        className="w-full sm:w-auto min-w-[200px] h-14 rounded-2xl bg-[#66bb6a] hover:bg-[#4caf50] text-white font-medium text-lg shadow-lg shadow-green-200 transition-all hover:scale-105 active:scale-95"
                    >
                        Try Another Path
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/resources')}
                        className="w-full sm:w-auto min-w-[200px] h-14 rounded-2xl border-[#a5d6a7] text-[#37474f] bg-white/50 hover:bg-white hover:border-[#66bb6a] font-medium transition-all"
                    >
                        Return to Resources
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
