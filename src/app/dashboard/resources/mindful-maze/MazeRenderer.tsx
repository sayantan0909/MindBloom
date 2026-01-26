"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TrailPoint {
    x: number;
    y: number;
    opacity: number;
    id: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    opacity: number;
}

interface MazeRendererProps {
    maze: string[];
    player: { x: number; y: number };
    trail: TrailPoint[];
    cellSize: number;
    particles: Particle[];
}

export function MazeRenderer({
    maze,
    player,
    trail,
    cellSize,
    particles
}: MazeRendererProps) {
    return (
        <div
            className="relative bg-white/50 backdrop-blur-sm p-4 sm:p-6 rounded-3xl shadow-2xl overflow-hidden border border-white/40"
            style={{
                display: 'inline-block',
                touchAction: 'none'
            }}
        >
            <div className="relative">
                {maze.map((row, y) => (
                    <div key={y} style={{ display: 'flex', height: cellSize }}>
                        {row.split('').map((cell, x) => {
                            const isPlayer = player.x === x && player.y === y;
                            const isTrail = trail.find(t => t.x === x && t.y === y);
                            const trailOpacity = isTrail ? isTrail.opacity : 0;

                            return (
                                <div
                                    key={x}
                                    style={{
                                        width: cellSize,
                                        height: cellSize,
                                        backgroundColor: cell === '#' ? '#a5d6a7' : '#e8f5e9',
                                        position: 'relative',
                                    }}
                                    className={`${cell === '#' ? 'rounded-sm' : ''} transition-colors duration-500`}
                                >
                                    {/* Trail glow */}
                                    <AnimatePresence>
                                        {trailOpacity > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: trailOpacity * 0.5 }}
                                                exit={{ opacity: 0 }}
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    backgroundColor: '#81c784',
                                                    borderRadius: '50%',
                                                }}
                                            ></motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Player */}
                                    {isPlayer && (
                                        <motion.div
                                            layoutId="player"
                                            style={{
                                                position: 'absolute',
                                                inset: 2,
                                                background: 'radial-gradient(circle, #66bb6a, #2e7d32)',
                                                borderRadius: '50%',
                                                boxShadow: '0 0 20px rgba(129, 199, 132, 0.8)',
                                                zIndex: 10
                                            }}
                                            animate={{
                                                scale: [1, 1.05, 1],
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        ></motion.div>
                                    )}

                                    {/* Start marker */}
                                    {cell === 'S' && (
                                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                            <span className="text-[10px] font-bold text-[#37474f]">S</span>
                                        </div>
                                    )}

                                    {/* End marker */}
                                    {cell === 'E' && (
                                        <motion.div
                                            style={{
                                                position: 'absolute',
                                                inset: 4,
                                                background: 'radial-gradient(circle, #ffd54f, #ffa726)',
                                                borderRadius: '50%',
                                                zIndex: 5
                                            }}
                                            animate={{
                                                scale: [1, 1.1, 1],
                                                opacity: [0.4, 0.7, 0.4]
                                            }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="text-[10px] font-bold text-[#37474f]">E</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}

                {/* Particles */}
                {particles.map(particle => (
                    <motion.div
                        key={particle.id}
                        initial={{ opacity: 1, scale: 0 }}
                        animate={{ opacity: 0, scale: 1, y: -20 }}
                        style={{
                            position: 'absolute',
                            left: particle.x,
                            top: particle.y,
                            width: 8,
                            height: 8,
                            background: '#81c784',
                            borderRadius: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            zIndex: 20
                        }}
                    ></motion.div>
                ))}
            </div>
        </div>
    );
}
