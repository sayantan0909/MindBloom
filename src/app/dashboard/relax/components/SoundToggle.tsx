'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  soundSrc: string;
}

export function SoundToggle({ soundSrc }: SoundToggleProps) {
  const [isSoundOn, setIsSoundOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create the Audio object once when the component mounts
    audioRef.current = new Audio(soundSrc);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Default to a soft volume

    // Cleanup function to pause and nullify the audio element on unmount
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [soundSrc]);

  useEffect(() => {
    // Effect to play or pause the audio when isSoundOn state changes
    if (isSoundOn) {
      audioRef.current?.play().catch(error => console.error("Audio play failed:", error));
    } else {
      audioRef.current?.pause();
    }
  }, [isSoundOn]);

  const toggleSound = () => {
    setIsSoundOn(prev => !prev);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleSound}
      className="absolute top-0 right-0 z-20"
      aria-label={isSoundOn ? 'Mute sound' : 'Unmute sound'}
    >
      {isSoundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  );
}
