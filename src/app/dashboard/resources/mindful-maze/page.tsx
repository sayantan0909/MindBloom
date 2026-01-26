"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MazeGame from './MazeGame';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Leaf, Wind, Sparkles } from 'lucide-react';

export default function MindfulMazePage() {
    const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f1f8f4] via-[#e8f5e9] to-[#f1f8f4] relative overflow-hidden flex flex-col items-center">
            {/* Ambient background decorative elements */}
            <div className="absolute top-0 w-full h-full pointer-events-none opacity-20">
                <motion.div
                    animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute top-20 left-10 w-64 h-64 bg-[#a5d6a7] rounded-full blur-[80px]"
                />
                <motion.div
                    animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute bottom-40 right-10 w-96 h-96 bg-[#81c784] rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 w-full max-w-5xl px-6 py-12 md:py-20 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {!difficulty ? (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center w-full max-w-2xl"
                        >
                            <div className="mb-10">
                                <h1 className="text-5xl font-light text-[#37474f] mb-4 tracking-tight">Mindful Maze</h1>
                                <p className="text-xl text-[#546e7a] font-light leading-relaxed">
                                    A sanctuary for your thoughts. Choose a journey below and navigate with peace.
                                    Focus on your breath, not the destination.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                <DifficultyCard
                                    title="Gentle Path"
                                    description="A short, calming walk to center your mind."
                                    icon={<Wind className="text-[#81c784]" size={24} />}
                                    onClick={() => setDifficulty('beginner')}
                                />
                                <DifficultyCard
                                    title="Winding Way"
                                    description="Explore deeper patterns and stay present."
                                    icon={<Leaf className="text-[#66bb6a]" size={24} />}
                                    onClick={() => setDifficulty('intermediate')}
                                />
                                <DifficultyCard
                                    title="Deep Journey"
                                    description="A meditative challenge for sustained focus."
                                    icon={<Sparkles className="text-[#4caf50]" size={24} />}
                                    onClick={() => setDifficulty('advanced')}
                                />
                            </div>

                            <div className="mt-12 p-6 rounded-3xl bg-white/40 border border-[#a5d6a7]/20 backdrop-blur-md">
                                <h3 className="text-sm font-bold text-[#37474f] uppercase tracking-widest mb-4">How to Mindfully Navigate</h3>
                                <div className="flex flex-wrap justify-center gap-8 text-[#546e7a] text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold">↑↓</span>
                                        <span>WASD or Arrow Keys</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center font-bold">↔</span>
                                        <span>Swipe on Mobile</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full flex justify-center"
                        >
                            <MazeGame difficulty={difficulty} onBack={() => setDifficulty(null)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function DifficultyCard({ title, description, icon, onClick }: { title: string, description: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <Card
            className="group bg-white/60 hover:bg-white border-[#a5d6a7]/20 hover:border-[#66bb6a]/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden rounded-[30px]"
            onClick={onClick}
        >
            <div className="p-1 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-3xl bg-[#f1f8f4] flex items-center justify-center group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="flex-1 text-center sm:text-left">
                    <CardTitle className="text-2xl font-light text-[#37474f] group-hover:text-[#2e7d32] transition-colors">{title}</CardTitle>
                    <CardDescription className="text-base text-[#78909c]">{description}</CardDescription>
                </div>
                <div className="px-6 py-4">
                    <Button className="rounded-2xl bg-[#a5d6a7]/20 group-hover:bg-[#66bb6a] text-[#2e7d32] group-hover:text-white transition-all">
                        Begin
                    </Button>
                </div>
            </div>
        </Card>
    );
}
