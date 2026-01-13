'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] bg-background text-center p-4">
      <AnimatePresence mode="wait">
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="text-2xl md:text-3xl font-semibold text-foreground max-w-2xl"
        >
          {steps[currentStep].text}
        </motion.p>
      </AnimatePresence>
      {currentStep === steps.length - 1 && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5}}
        >
            <Button onClick={() => setCurrentStep(0)} className="mt-8">
                Restart Exercise
            </Button>
        </motion.div>
      )}
    </div>
  );
}
