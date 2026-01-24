'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FloatingSoundControl } from './FloatingSoundControl';

type Phase = 'move' | 'pause';
type Direction = 'left' | 'right';

export function DotFocus() {
  /* ---------------- SOUND (UNCHANGED) ---------------- */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/calm.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
    }

    try {
      soundOn ? audioRef.current.pause() : await audioRef.current.play();
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

  /* ---------------- DOT LOGIC ---------------- */
  const [phase, setPhase] = useState<Phase>('move');
  const [direction, setDirection] = useState<Direction>('right');

  // EMDR timing: move → pause → switch direction
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (phase === 'move') {
      timer = setTimeout(() => {
        setPhase('pause');
      }, 5500); // slow tracking
    } else {
      timer = setTimeout(() => {
        setDirection(d => (d === 'right' ? 'left' : 'right'));
        setPhase('move');
      }, 1500); // stillness = nervous system reset
    }

    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[60vh] overflow-visible">

      {/* KEEP CALM SOUND */}
      <FloatingSoundControl soundOn={soundOn} toggle={toggleSound} />

      {/* DOT FIELD */}
      <div className="relative w-full h-full flex items-center justify-center">

        <motion.div
          animate={
            phase === 'move'
              ? {
                x: direction === 'right' ? '35vw' : '-35vw',
                y: ['0vh', '-8vh', '0vh'], // gentle curve (NOT straight)
              }
              : {
                x: direction === 'right' ? '35vw' : '-35vw',
                y: '0vh',
              }
          }
          transition={
            phase === 'move'
              ? { duration: 5.5, ease: 'easeInOut' }
              : { duration: 0 }
          }
          className="relative flex items-center justify-center"
        >

          {/* 🌫 OUTER AURA */}
          <div
            className="
              absolute
              w-20 h-20
              rounded-full
              bg-blue-400/20
              blur-2xl
            "
          />

          {/* ✨ INNER GLOW */}
          <div
            className="
              absolute
              w-10 h-10
              rounded-full
              bg-blue-300/30
              blur-md
            "
          />

          {/* 🔵 CORE DOT (BREATH-SYNCED, ALIVE) */}
          <motion.div
            animate={{
              scale: [1, 1.08, 1],       // inhale → exhale
              opacity: [0.85, 1, 0.85], // subtle shimmer
            }}
            transition={{
              duration: 6.5,
              ease: 'easeInOut',
              repeat: Infinity,
            }}
            className="
              w-3.5 h-3.5
              rounded-full
              bg-gradient-to-br
              from-blue-500
              to-cyan-400
              shadow-[0_0_14px_rgba(100,180,255,0.65)]
            "
          />
        </motion.div>
      </div>

      {/* INSTRUCTION */}
      <p className="absolute bottom-10 text-lg font-medium text-muted-foreground">
        Follow the dot with your eyes.
      </p>
    </div>
  );
}
