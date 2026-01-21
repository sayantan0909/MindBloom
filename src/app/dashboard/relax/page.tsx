'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Wind, Hand, Eye, Zap, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { StressGameCard } from '../components/StressGameCard';
import { BreathingBubble } from './components/BreathingBubble';
import { MuscleRelease } from './components/MuscleRelease';
import { DotFocus } from './components/DotFocus';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientText } from '@/components/ui/gradient-text';

type ActiveGame = 'breathing' | 'muscle' | 'focus' | null;

function RelaxContent() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const game = searchParams.get('game');
    if (game === 'breathing' || game === 'muscle' || game === 'focus') {
      setActiveGame(game);
    }
  }, [searchParams]);

  const games = {
    breathing: <BreathingBubble />,
    muscle: <MuscleRelease />,
    focus: <DotFocus />,
  };

  const renderContent = () => {
    if (activeGame) {
      return (
        <motion.div
          key="game"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          <Button
            variant="ghost"
            onClick={() => setActiveGame(null)}
            className="absolute top-0 left-0 z-10 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-800/40 backdrop-blur-md transition-all border border-transparent hover:border-white/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
          </Button>
          <div className="mt-16">
            {games[activeGame]}
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div
        key="menu"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-12"
      >
        <div className="text-center space-y-6">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="mx-auto bg-gradient-to-br from-amber-400 to-orange-600 p-6 rounded-[2rem] w-fit shadow-2xl shadow-amber-500/20"
          >
            <Zap className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            <GradientText colors={['#fbbf24', '#f59e0b', '#ea580c']}>
              Relax & Reset
            </GradientText>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Take a moment to unwind with these short, guided exercises designed to <span className="text-amber-600 dark:text-amber-400 font-bold">calm your mind</span> and release tension.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          <StressGameCard
            title="Breathing Bubble"
            description="Sync your breath with a calming visual guide to lower stress and find your center."
            icon={Wind}
            onClick={() => setActiveGame('breathing')}
          />
          <StressGameCard
            title="Muscle Release"
            description="Follow a simple guide to progressively tense and release facial muscles, melting away physical stress."
            icon={Hand}
            onClick={() => setActiveGame('muscle')}
          />
          <StressGameCard
            title="Dot Focus"
            description="Gently guide your eyes to follow a slowly moving dot, helping to quiet a busy mind."
            icon={Eye}
            onClick={() => setActiveGame('focus')}
          />
        </div>

        <div className="text-center pt-8">
          <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" /> Recommended for high-stress moments <Sparkles className="h-4 w-4" />
          </p>
        </div>
      </motion.div>
    );
  }

  return <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>;
}


export default function RelaxPage() {
  return (
    <div className="min-h-screen py-6 px-4 md:px-8">
      <Suspense fallback={<div className="flex items-center justify-center h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>}>
        <RelaxContent />
      </Suspense>
    </div>
  )
}
