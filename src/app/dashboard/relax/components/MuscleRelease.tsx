'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FloatingSoundControl } from './FloatingSoundControl';
import { useVoiceGuide } from '@/hooks/useVoiceGuide';

const steps = [
  { text: 'Get comfortable in your seat.', duration: 4000 },
  { text: 'Close your eyes and take a deep breath.', duration: 4000 },
  { text: 'Gently clench your jaw for a moment...', duration: 3000 },
  { text: '...and now release. Feel the tension melt away.', duration: 5000 },
  { text: 'Now, raise your eyebrows as high as you can...', duration: 3000 },
  { text: '...and release. Let your forehead become smooth.', duration: 5000 },
  { text: 'Finally, just sit for a moment and enjoy the feeling of relaxation.', duration: 8000 },
  { text: 'Exercise complete. You can return or restart.', duration: Infinity },
];

export function MuscleRelease() {
  const [currentStep, setCurrentStep] = useState(0);

  /* -------- SOUND -------- */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = async () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('/sounds/calm.mp3');
      audioRef.current.loop = true;
      audioRef.current.volume = 0.25;
    }

    soundOn ? audioRef.current.pause() : await audioRef.current.play();
    setSoundOn(!soundOn);
  };

  /* -------- VOICE -------- */
  const {
    voiceEnabled,
    voiceOn,
    setVoiceOn,
    enableVoice,
    speak,
  } = useVoiceGuide();

  /* Speak each step */
  useEffect(() => {
    speak(steps[currentStep].text);
  }, [currentStep]);

  /* Step timing */
  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(
        () => setCurrentStep(prev => prev + 1),
        steps[currentStep].duration
      );
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  /* Cleanup audio */
  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] text-center p-4">

      <FloatingSoundControl soundOn={soundOn} toggle={toggleSound} />

      {/* VOICE BUTTON */}
      {!voiceEnabled ? (
        <button
          onClick={enableVoice}
          className="fixed bottom-20 right-6 z-50 rounded-full
                     px-4 py-2 backdrop-blur-xl bg-white/60 shadow-lg"
        >
          🗣 Enable Voice
        </button>
      ) : (
        <button
          onClick={() => setVoiceOn(!voiceOn)}
          className="fixed bottom-20 right-6 z-50 rounded-full
                     px-4 py-2 backdrop-blur-xl bg-white/60 shadow-lg"
        >
          {voiceOn ? '🗣 Voice On' : '🔇 Voice Off'}
        </button>
      )}

      <AnimatePresence mode="wait">
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="text-2xl md:text-3xl font-semibold max-w-2xl"
        >
          {steps[currentStep].text}
        </motion.p>
      </AnimatePresence>

      {currentStep === steps.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button onClick={() => setCurrentStep(0)} className="mt-8">
            Restart Exercise
          </Button>
        </motion.div>
      )}
    </div>
  );
}
