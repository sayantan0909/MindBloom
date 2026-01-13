'use client';

import { useState } from 'react';
import { Wind, Hand, Eye, Zap } from 'lucide-react';
import { StressGameCard } from '../components/StressGameCard';
import { BreathingBubble } from './components/BreathingBubble';
import { MuscleRelease } from './components/MuscleRelease';
import { DotFocus } from './components/DotFocus';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type ActiveGame = 'breathing' | 'muscle' | 'focus' | null;

export default function RelaxPage() {
  const [activeGame, setActiveGame] = useState<ActiveGame>(null);

  const games = {
    breathing: <BreathingBubble />,
    muscle: <MuscleRelease />,
    focus: <DotFocus />,
  };

  if (activeGame) {
    return (
      <div className="relative">
        <Button 
          variant="ghost" 
          onClick={() => setActiveGame(null)}
          className="absolute top-0 left-0 z-10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exercises
        </Button>
        <div className="mt-12">
          {games[activeGame]}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
          <Zap className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Relax & Reset</h1>
        <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto">
          Take a moment to unwind with these short, guided exercises designed to calm your mind and release tension.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
    </div>
  );
}
