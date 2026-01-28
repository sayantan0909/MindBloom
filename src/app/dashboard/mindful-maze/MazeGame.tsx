"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import * as Tone from 'tone';
import { motion, AnimatePresence } from 'framer-motion';
import { MAZES, AFFIRMATIONS } from './mazeData';
import { MazeRenderer } from './MazeRenderer';
import { BreathingGuide } from './BreathingGuide';
import { CompletionScreen } from './CompletionScreen';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface MazeGameProps {
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    onBack: () => void;
}

export default function MazeGame({ difficulty, onBack }: MazeGameProps) {
    const [gameState, setGameState] = useState<'playing' | 'completed'>('playing');
    const [player, setPlayer] = useState({ x: 0, y: 0 });
    const [trail, setTrail] = useState<{ x: number, y: number, opacity: number, id: number }[]>([]);
    const [breathPhase, setBreathPhase] = useState<'in' | 'out'>('in');
    const [showAffirmation, setShowAffirmation] = useState(false);
    const [currentAffirmation, setCurrentAffirmation] = useState('');
    const [progress, setProgress] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [particles, setParticles] = useState<{ id: number, x: number, y: number, opacity: number }[]>([]);
    const [lastProgress, setLastProgress] = useState(0);
    const [cellSize, setCellSize] = useState(32);

    const synthRef = useRef<Tone.PolySynth | null>(null);
    const touchStartRef = useRef({ x: 0, y: 0 });
    const completionSoundRef = useRef<Tone.PolySynth | null>(null);

    // Initialize sounds
    useEffect(() => {
        const reverb = new Tone.Reverb(2).toDestination();
        synthRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: { attack: 0.2, decay: 0.1, sustain: 0.3, release: 1 }
        }).connect(reverb);
        synthRef.current.volume.value = -20;

        completionSoundRef.current = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.5, decay: 0.2, sustain: 0.5, release: 2 }
        }).toDestination();
        completionSoundRef.current.volume.value = -15;

        return () => {
            synthRef.current?.dispose();
            completionSoundRef.current?.dispose();
        };
    }, []);

    // Responsive cell size
    useEffect(() => {
        const updateSize = () => {
            setCellSize(window.innerWidth < 640 ? 24 : (window.innerWidth < 1024 ? 28 : 32));
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Find start and end positions
    const findPositions = useCallback((maze: string[]) => {
        let start = { x: 1, y: 1 };
        let end = { x: 1, y: 1 };

        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                if (maze[y][x] === 'S') start = { x, y };
                if (maze[y][x] === 'E') end = { x, y };
            }
        }

        return { start, end };
    }, []);

    // Initialize player position
    useEffect(() => {
        const { start } = findPositions(MAZES[difficulty]);
        setPlayer(start);
    }, [difficulty, findPositions]);

    // Breathing cycle
    useEffect(() => {
        const breathInterval = setInterval(() => {
            setBreathPhase(prev => {
                const next = prev === 'in' ? 'out' : 'in';
                return next;
            });
        }, breathPhase === 'in' ? 3000 : 4000);

        return () => clearInterval(breathInterval);
    }, [breathPhase]);

    // Progress logic
    useEffect(() => {
        if (gameState !== 'playing') return;

        const maze = MAZES[difficulty];
        const { start, end } = findPositions(maze);

        // Simple manhattan distance progress
        const distanceToEnd = Math.abs(player.x - end.x) + Math.abs(player.y - end.y);
        const maxDistance = Math.abs(start.x - end.x) + Math.abs(start.y - end.y);
        const currentProgress = Math.min(100, Math.max(0, ((maxDistance - distanceToEnd) / maxDistance) * 100));

        setProgress(currentProgress);

        // Affirmations
        const milestones = [25, 50, 75];
        milestones.forEach((m, i) => {
            if (currentProgress >= m && lastProgress < m) {
                setCurrentAffirmation(AFFIRMATIONS[i]);
                setShowAffirmation(true);
                setTimeout(() => setShowAffirmation(false), 3000);
                setLastProgress(m);
            }
        });

        // Win condition
        if (maze[player.y][player.x] === 'E') {
            setTimeout(() => {
                setGameState('completed');
                if (soundEnabled) {
                    Tone.start();
                    completionSoundRef.current?.triggerAttackRelease(['E4', 'G4', 'C5'], '2n');
                }
            }, 500);
        }
    }, [player, difficulty, gameState, lastProgress, soundEnabled, findPositions]);

    const playMoveSound = useCallback(() => {
        if (!soundEnabled) return;
        Tone.start();
        const notes = ['E4', 'G4', 'A4', 'B4', 'D5'];
        const note = notes[Math.floor(Math.random() * notes.length)];
        synthRef.current?.triggerAttackRelease(note, '8n');
    }, [soundEnabled]);

    const addParticle = useCallback((x: number, y: number, cellSize: number) => {
        const newParticle = {
            id: Date.now() + Math.random(),
            x: x * cellSize + cellSize / 2,
            y: y * cellSize + cellSize / 2,
            opacity: 1
        };
        setParticles(prev => [...prev.slice(-10), newParticle]);
    }, []);

    const movePlayer = useCallback((dx: number, dy: number) => {
        if (gameState !== 'playing') return;

        const maze = MAZES[difficulty];
        const newX = player.x + dx;
        const newY = player.y + dy;

        if (newY >= 0 && newY < maze.length && newX >= 0 && newX < maze[0].length) {
            if (maze[newY][newX] !== '#') {
                setPlayer({ x: newX, y: newY });
                setTrail(prev => [...prev.slice(-20), { x: player.x, y: player.y, opacity: 1, id: Date.now() }]);
                playMoveSound();
                addParticle(newX, newY, cellSize);
            }
        }
    }, [player, difficulty, gameState, playMoveSound, addParticle, cellSize]);

    // Keyboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (gameState !== 'playing') return;
            const key = e.key.toLowerCase();
            if (['arrowup', 'w'].includes(key)) movePlayer(0, -1);
            if (['arrowdown', 's'].includes(key)) movePlayer(0, 1);
            if (['arrowleft', 'a'].includes(key)) movePlayer(-1, 0);
            if (['arrowright', 'd'].includes(key)) movePlayer(1, 0);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer, gameState]);

    // Swipe
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
        const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
        if (Math.abs(dx) > Math.abs(dy)) {
            if (Math.abs(dx) > 30) movePlayer(dx > 0 ? 1 : -1, 0);
        } else {
            if (Math.abs(dy) > 30) movePlayer(0, dy > 0 ? 1 : -1);
        }
    };

    // Trail fade
    useEffect(() => {
        const interval = setInterval(() => {
            setTrail(prev => prev.map(t => ({ ...t, opacity: t.opacity - 0.05 })).filter(t => t.opacity > 0));
            setParticles(prev => prev.map(p => ({ ...p, opacity: p.opacity - 0.05 })).filter(p => p.opacity > 0));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center">
            <AnimatePresence>
                {gameState === 'playing' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center"
                    >
                        <BreathingGuide phase={breathPhase} />

                        <div className="relative">
                            <MazeRenderer
                                maze={MAZES[difficulty]}
                                player={player}
                                trail={trail}
                                cellSize={cellSize}
                                particles={particles}
                            />

                            {/* Touch area for mobile */}
                            <div
                                className="absolute inset-0 z-20 md:hidden"
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                            />

                            <AnimatePresence>
                                {showAffirmation && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
                                    >
                                        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-[#a5d6a7]/30 text-[#37474f] text-lg whitespace-nowrap">
                                            {currentAffirmation}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="mt-8 flex items-center gap-6 w-full max-w-xs">
                            <div className="flex-1 h-2 bg-white/40 rounded-full overflow-hidden border border-white/20">
                                <motion.div
                                    className="h-full bg-[#66bb6a]"
                                    animate={{ width: `${progress}%` }}
                                    transition={{ type: "spring", bounce: 0 }}
                                />
                            </div>
                            <button
                                onClick={() => setSoundEnabled(!soundEnabled)}
                                className="p-3 rounded-full bg-white/60 hover:bg-white text-[#37474f] shadow-md transition-all active:scale-90"
                            >
                                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                            </button>
                        </div>

                        <Button
                            variant="ghost"
                            onClick={onBack}
                            className="mt-8 text-[#546e7a] hover:text-[#37474f]"
                        >
                            ← Back to Level Selection
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {gameState === 'completed' && (
                <CompletionScreen onRetry={() => {
                    setGameState('playing');
                    setLastProgress(0);
                    setProgress(0);
                }} />
            )}
        </div>
    );
}
