'use client';

import { motion } from 'framer-motion';

export function DotFocus() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[60vh] bg-background overflow-hidden">
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
