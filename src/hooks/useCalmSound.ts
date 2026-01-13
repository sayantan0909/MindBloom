'use client';

import { useRef, useState, useEffect } from 'react';

export function useCalmSound(soundSrc: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);

  useEffect(() => {
    // Initialize Audio element on mount
    audioRef.current = new Audio(soundSrc);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    // Cleanup on unmount
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [soundSrc]);

  useEffect(() => {
    // Play or pause when isSoundOn changes
    if (isSoundOn) {
      audioRef.current?.play().catch(error => console.error("Audio play failed:", error));
    } else {
      audioRef.current?.pause();
    }
  }, [isSoundOn]);

  const toggleSound = () => {
    setIsSoundOn(prev => !prev);
  };

  return { isSoundOn, toggleSound };
}
