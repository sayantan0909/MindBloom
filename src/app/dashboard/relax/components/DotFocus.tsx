'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export function DotFocus() {
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
    } catch(e) {
        console.error("Audio blocked:", e);
    }
  };

  // Effect to clean up audio on unmount
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[60vh] bg-background overflow-hidden">
        <button
          onClick={toggleSound}
          type="button"
          className="fixed top-6 right-6 z-50 bg-white/80 rounded-full p-2 shadow"
        >
          {soundOn ? '🔊' : '🔈'}
        </button>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="w-full h-full flex items-center justify-center"
        >
            <motion.div
                animate={{
                x: ['-45vw', '45vw', '45vw', '-45vw', '-45vw'],
                y: ['-25vh', '-25vh', '25vh', '25vh', '-25vh'],
                }}
                transition={{
                duration: 20,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
                }}
                className="w-6 h-6 bg-primary rounded-full shadow-lg"
            />
        </motion.div>
      <p className="absolute bottom-10 text-xl font-semibold text-muted-foreground">
        Follow the dot with your eyes.
      </p>
    </div>
  );
}
