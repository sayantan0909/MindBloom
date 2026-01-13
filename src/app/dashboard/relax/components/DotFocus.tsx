'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function DotFocus() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);

  const toggleSound = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/calm-and-peaceful-ambient-music-60-second-version-183030.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }
    
     try {
        if (isSoundOn) {
            audioRef.current.pause();
        } else {
            await audioRef.current.play();
        }
        setIsSoundOn(!isSoundOn);
    } catch(e) {
        console.error("Audio play failed:", e);
        setIsSoundOn(false);
    }
  };

  // Effect to clean up audio on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[60vh] bg-background overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSound}
          className="absolute top-0 right-0 z-20"
          aria-label={isSoundOn ? 'Mute sound' : 'Unmute sound'}
        >
          {isSoundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </Button>
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
