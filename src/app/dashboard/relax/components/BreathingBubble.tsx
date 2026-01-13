'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { SoundToggle } from './SoundToggle';

// Define the phases of the breathing cycle
const breathingCycle = [
  { text: 'Breathe in...', duration: 4000, scale: 1.5 },
  { text: 'Hold', duration: 4000, scale: 1.5 },
  { text: 'Breathe out...', duration: 4000, scale: 1 },
];

const SESSION_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
const AMBIENT_SOUND_SRC = 'https://storage.googleapis.com/sound-effects-library/breathing-deep-and-calm-102981.mp3';


export function BreathingBubble() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Effect to manage the breathing cycle
  useEffect(() => {
    if (!isSessionActive) return;

    // Set a timer for the next phase in the cycle
    const cycleTimer = setTimeout(() => {
      setPhaseIndex((prevIndex) => (prevIndex + 1) % breathingCycle.length);
    }, breathingCycle[phaseIndex].duration);

    return () => clearTimeout(cycleTimer);
  }, [phaseIndex, isSessionActive]);

  // Effect to manage the total session duration
  useEffect(() => {
    if (!isSessionActive) return;
    const sessionTimer = setTimeout(() => {
      setIsSessionActive(false);
    }, SESSION_DURATION);

    return () => clearTimeout(sessionTimer);
  }, [isSessionActive]);

  const handleRestart = () => {
    setPhaseIndex(0);
    setIsSessionActive(true);
  };

  const currentPhase = breathingCycle[phaseIndex];

  return (
    <div className="relative flex flex-col items-center justify-center h-[60vh] bg-background">
      <SoundToggle soundSrc={AMBIENT_SOUND_SRC} />
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
            <motion.div
              animate={{ scale: currentPhase.scale }}
              transition={{ duration: currentPhase.duration / 1000, ease: 'easeInOut' }}
              className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-blue-200 to-green-200 dark:from-blue-900/50 dark:to-green-900/50 rounded-full flex items-center justify-center shadow-lg"
            >
              <motion.div 
                  className="w-40 h-40 md:w-56 md:h-56 bg-gradient-to-br from-blue-300 to-green-300 dark:from-blue-800/50 dark:to-green-800/50 rounded-full"
                  animate={{ scale: currentPhase.scale === 1.5 ? 1.2 : 1 }}
                  transition={{ duration: currentPhase.duration / 1000, ease: 'easeInOut' }}
              />
            </motion.div>
            <motion.p
              key={currentPhase.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="mt-12 text-2xl font-semibold text-muted-foreground"
            >
              {currentPhase.text}
            </motion.p>
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
