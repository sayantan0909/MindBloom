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

export function BreathingBubble() {
  const [cycleIndex, setCycleIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [count, setCount] = useState(1);
  
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
    if (!isSessionActive) return;

    const cycleTimer = setTimeout(() => {
      setCycleIndex((prevIndex) => (prevIndex + 1) % breathingCycle.length);
    }, breathingCycle[cycleIndex].duration);

    return () => clearTimeout(cycleTimer);
  }, [cycleIndex, isSessionActive]);

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
    }, SESSION_DURATION);

    return () => clearTimeout(sessionTimer);
  }, [isSessionActive]);
  
  const handleRestart = () => {
    setCycleIndex(0);
    setIsSessionActive(true);
  };

  return (
    <div className="relative flex flex-col items-center justify-center h-[60vh] bg-background">
      <FloatingSoundControl soundOn={soundOn} toggle={toggleSound} />
      <AnimatePresence mode="wait">
        {isSessionActive ? (
          <motion.div
            key="bubble"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center"
          >
            <div className="w-[420px] h-[420px] flex items-center justify-center relative">
                <div
                    className={`relative rounded-full transition-all duration-[4000ms] ease-in-out
              bg-gradient-to-br ${phaseStyles[phase]} animate-[float_6s_ease-in-out_infinite]`}
                    style={{
                        width: bubbleSize[phase],
                        height: bubbleSize[phase],
                        boxShadow: '0 0 60px rgba(100, 200, 200, 0.4)',
                    }}
                >
                    <div className="absolute inset-0 flex items-center justify-center text-6xl font-light text-white/90">
                        {count}
                    </div>
                </div>
            </div>
            <p className="mt-12 text-2xl font-semibold text-muted-foreground">
                {phase === 'inhale' && 'Breathe in'}
                {phase === 'hold' && 'Hold'}
                {phase === 'exhale' && 'Breathe out'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="completion"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            <p className="text-2xl font-semibold text-foreground mb-6">
              Breathing consistency improved.
            </p>
            <Button onClick={handleRestart}>Restart Session</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
