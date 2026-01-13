'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FloatingSoundControl } from './FloatingSoundControl';

type Phase = 'inhale' | 'hold' | 'exhale';

const breathingCycle: { phase: Phase; text: string; duration: number }[] = [
  { phase: 'inhale', text: 'Breathe in...', duration: 4000 },
  { phase: 'hold', text: 'Hold', duration: 4000 },
  { phase: 'exhale', text: 'Breathe out...', duration: 4000 },
];

const phaseStyles: Record<Phase, string> = {
  inhale: 'from-sky-400 via-cyan-300 to-teal-300',
  hold: 'from-purple-300 via-indigo-300 to-blue-300',
  exhale: 'from-emerald-300 via-green-300 to-lime-200',
};

const bubbleSize = {
  inhale: 420,
  hold: 420,
  exhale: 260,
};

const SESSION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const finalSize = 320;

export function BreathingBubble() {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [count, setCount] = useState(1);
  const [completed, setCompleted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/calm.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
    }

    try {
      if (soundOn) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setSoundOn(!soundOn);
    } catch (e) {
      console.error('Audio blocked:', e);
    }
  };
  
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const currentPhase = breathingCycle[cycleIndex];
  const phase: Phase = currentPhase.phase;

  useEffect(() => {
    if (!isSessionActive || completed) return;

    const cycleTimer = setTimeout(() => {
      setCycleIndex((prevIndex) => (prevIndex + 1) % breathingCycle.length);
    }, breathingCycle[cycleIndex].duration);

    return () => clearTimeout(cycleTimer);
  }, [cycleIndex, isSessionActive, completed]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev === 4 ? 1 : prev + 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (!isSessionActive) return;
    const sessionTimer = setTimeout(() => {
      setIsSessionActive(false);
      setCompleted(true);
    }, SESSION_DURATION);

    return () => clearTimeout(sessionTimer);
  }, [isSessionActive]);
  
  const handleRestart = () => {
    setCycleIndex(0);
    setIsSessionActive(true);
    setCompleted(false);
  };
  
  const arrow = phase === 'inhale' ? '↑'
            : phase === 'exhale' ? '↓'
            : '•';

  return (
    <div className="relative flex flex-col items-center justify-center h-[60vh] bg-background overflow-hidden">
        <div
            className={`absolute inset-0 transition-colors duration-[4000ms] ${
                completed ? 'bg-emerald-50' : 'bg-background'
            }`}
        />
      <FloatingSoundControl soundOn={soundOn} toggle={toggleSound} />
        <div className="relative flex flex-col items-center justify-center">
            <div className="w-[420px] h-[420px] flex items-center justify-center relative">
                <div
                    className={`relative rounded-full transition-all duration-[3000ms] ease-out
                        ${!completed ? `bg-gradient-to-br ${phaseStyles[phase]}` : 'bg-gradient-to-br from-emerald-300 to-teal-200'}
                        ${!completed && phase !== 'hold' ? 'animate-[float_6s_ease-in-out_infinite]' : ''}
                        ${completed ? 'shadow-[0_0_120px_rgba(120,255,200,0.7)]' : 'shadow-lg'}
                    `}
                    style={{
                        width: completed ? finalSize : bubbleSize[phase],
                        height: completed ? finalSize : bubbleSize[phase],
                    }}
                >
                    {!completed && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-6xl text-white/90">{arrow}</div>
                            <div className="text-5xl font-light text-white/90 mt-2">{count}</div>
                        </div>
                    )}
                </div>
            </div>

            {!completed ? (
                <p className="mt-6 text-lg text-muted-foreground z-10">
                    {phase === 'inhale' && 'Breathe in'}
                    {phase === 'hold' && 'Hold'}
                    {phase === 'exhale' && 'Breathe out'}
                </p>
            ) : (
                <div className="mt-8 text-center animate-fade-in z-10">
                    <p className="text-xl font-medium text-emerald-700">
                        Breathing session complete
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Your body is now in a calmer state
                    </p>
                    <button
                        onClick={handleRestart}
                        className="mt-6 rounded-full px-6 py-2 bg-emerald-600 text-white
                                hover:bg-emerald-500 transition"
                    >
                        Restart breathing
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}
