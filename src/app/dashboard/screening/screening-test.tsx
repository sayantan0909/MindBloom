'use client';

import { useState } from 'react';
import { mentalHealthData, ScreeningTool } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ScreeningQuestionnaire, ResultsDisplay } from './screening-questionnaire';
import { GlassCard } from '@/components/dashboard/glass-card';
import { GradientText } from '@/components/ui/gradient-text';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Activity } from 'lucide-react';

type TestType = 'phq9' | 'gad7';

export function ScreeningTest() {
  const [currentTest, setCurrentTest] = useState<TestType | null>(null);
  const [testData, setTestData] = useState<ScreeningTool | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const startTest = (type: TestType) => {
    setCurrentTest(type);
    setTestData(mentalHealthData[type]);
    setScore(null);
    setResult(null);
  };

  const resetTest = () => {
    setCurrentTest(null);
    setTestData(null);
    setScore(null);
    setResult(null);
  };

  const handleComplete = (completedScore: number, completedResult: string) => {
    setScore(completedScore);
    setResult(completedResult);
  }

  if (score !== null && result !== null && testData) {
    return <ResultsDisplay score={score} result={result} testData={testData} onReset={resetTest} />;
  }

  if (currentTest && testData) {
    return <ScreeningQuestionnaire testData={testData} onComplete={handleComplete} onBack={resetTest} />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <GlassCard className="h-full group">
          <div className="p-8 flex flex-col h-full">
            <div className="mb-6 bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Brain className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>

            <h3 className="text-2xl font-bold font-headline mb-4">
              <GradientText colors={['#7c3aed', '#ec4899']}>
                Depression (PHQ-9)
              </GradientText>
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed flex-grow">
              A clinically validated tool to screen for symptoms of depression and track changes over the last 2 weeks.
            </p>

            <Button
              onClick={() => startTest('phq9')}
              className="mt-8 w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 h-12 text-lg rounded-xl"
            >
              Start PHQ-9 Test <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard className="h-full group">
          <div className="p-8 flex flex-col h-full">
            <div className="mb-6 bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>

            <h3 className="text-2xl font-bold font-headline mb-4">
              <GradientText colors={['#4f46e5', '#3b82f6']}>
                Anxiety (GAD-7)
              </GradientText>
            </h3>

            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed flex-grow">
              The Generalized Anxiety Disorder assessment helps identify common symptoms and their impact on your daily life.
            </p>

            <Button
              onClick={() => startTest('gad7')}
              className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg shadow-indigo-500/25 h-12 text-lg rounded-xl"
            >
              Start GAD-7 Test <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
