'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const breathingCycle = [
  { text: 'Breathe in...', duration: 4000 },
  { text: 'Hold', duration: 4000 },
  { text: 'Breathe out...', duration: 6000 },
];

export function BreathingBubble() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase((prevPhase) => (prevPhase + 1) % breathingCycle.length);
    }, breathingCycle[phase].duration);

    return () => clearTimeout(timer);
  }, [phase]);

  const currentPhase = breathingCycle[phase];
  const isBreathingIn = currentPhase.text.includes('in');

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] bg-background">
      <motion.div
        key={phase}
        animate={{ scale: isBreathingIn ? 1.5 : 1 }}
        transition={{ duration: currentPhase.duration / 1000, ease: 'easeInOut' }}
        className="w-48 h-48 md:w-64 md:h-64 bg-primary/20 rounded-full flex items-center justify-center"
      >
        <motion.div 
            className="w-40 h-40 md:w-56 md:h-56 bg-primary/40 rounded-full"
            animate={{ scale: isBreathingIn ? 1.2 : 1 }}
            transition={{ duration: currentPhase.duration / 1000, ease: 'easeInOut' }}
        />
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={currentPhase.text}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="mt-12 text-2xl font-semibold text-muted-foreground"
        >
          {currentPhase.text}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
