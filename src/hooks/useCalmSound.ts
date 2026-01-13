'use client';

import { useRef, useState, useEffect } from 'react';

export function useCalmSound(soundSrc: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSoundOn, setIsSoundOn] = useState(false);

  // Effect to handle cleanup on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  const toggleSound = async () => {
    // Lazily create the Audio object on first interaction
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
        // Must await play() as it returns a promise
        await audio.play();
      }
      // Only toggle state if the action was successful
      setIsSoundOn(prev => !prev);
    } catch (err) {
      console.error('Audio play failed. User may need to interact with the page first.', err);
      // If play fails, ensure our state is correct (sound is off)
      setIsSoundOn(false);
    }
  };

  return { isSoundOn, toggleSound };
}
