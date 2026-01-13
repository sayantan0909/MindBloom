'use client';

import { useRef, useState, useEffect } from 'react';

export function useCalmSound(soundSrc: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);

  useEffect(() => {
    // This effect now only handles cleanup on unmount
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const toggleSound = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundSrc);
      audioRef.current.loop = true;
      audioRef.current.volume = 0.3;
    }

    const audio = audioRef.current;

    try {
      if (isSoundOn) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsSoundOn(prev => !prev);
    } catch (err) {
      console.error('Audio play failed:', err);
      // If play fails, ensure state is set to off
      setIsSoundOn(false);
    }
  };

  return { isSoundOn, toggleSound };
}
