'use client';

import { useState } from 'react';
import { ScreeningTool } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, RefreshCw, ChevronRight, BookOpen, CalendarCheck, Sparkles, Activity } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/dashboard/glass-card';
import { GradientText } from '@/components/ui/gradient-text';

interface ScreeningQuestionnaireProps {
  testData: ScreeningTool;
  onComplete: (score: number, result: string) => void;
  onBack: () => void;
}

export function ScreeningQuestionnaire({ testData, onComplete, onBack }: ScreeningQuestionnaireProps) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const totalQuestions = testData.questions.length;
  const currentQuestion = testData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value, 10) }));
    // Auto-advance after small delay for better UX? Or just wait for button.
    // Let's stick to the button for now to avoid accidental skips.
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const totalScore = Object.values(answers).reduce((acc, val) => acc + val, 0);

    let interpretation = '';
    for (const range in testData.scoring) {
      const [min, max] = range.split('-').map(num => parseInt(num));
      if (totalScore >= min && totalScore <= max) {
        interpretation = testData.scoring[range].interpretation;
        break;
      }
    }
    onComplete(totalScore, interpretation);
  };


  return (
    <div className="max-w-3xl mx-auto">
      <GlassCard className="overflow-hidden" hover={false}>
        <div className="p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-center">
              <h2 className="text-2xl font-bold font-headline">
                <GradientText colors={['#6366f1', '#a855f7']}>
                  {testData.name}
                </GradientText>
              </h2>
            </div>
            <div className="w-10"></div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
              <span>Progress</span>
              <span>{currentQuestionIndex + 1} of {totalQuestions}</span>
            </div>
            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="relative min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center space-y-2">
                  <p className="text-2xl font-semibold leading-tight text-slate-800 dark:text-slate-100">
                    {currentQuestion.text}?
                  </p>
                </div>

                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  value={answers[currentQuestion.id]?.toString()}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {testData.responses.map(r => {
                    const isSelected = answers[currentQuestion.id] === r.value;
                    return (
                      <Label
                        key={r.value}
                        className={cn(
                          "flex items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group",
                          isSelected
                            ? "bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-500 shadow-md shadow-indigo-500/10"
                            : "bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-700"
                        )}
                      >
                        <RadioGroupItem value={r.value.toString()} id={`${currentQuestion.id}-${r.value}`} className="sr-only" />
                        <span className={cn(
                          "text-base font-medium transition-colors",
                          isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                        )}>
                          {r.text}
                        </span>
                      </Label>
                    );
                  })}
                </RadioGroup>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion.id] === undefined}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl shadow-xl shadow-indigo-500/20 group"
            >
              {isLastQuestion ? 'View Results' : 'Next Question'}
              {isLastQuestion ? <Sparkles className="ml-2 h-5 w-5" /> : <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

interface ResultsDisplayProps {
  score: number;
  result: string;
  testData: ScreeningTool;
  onReset: () => void;
}

export function ResultsDisplay({ score, result, testData, onReset }: ResultsDisplayProps) {
  const maxScore = testData.questions.length * (testData.responses.length - 1);

  let scoreColor = "text-emerald-500";
  let scoreBg = "bg-emerald-500/10 dark:bg-emerald-500/20";
  let scoreBorder = "border-emerald-500/30";

  if (result.toLowerCase().includes("mild")) {
    scoreColor = "text-amber-500";
    scoreBg = "bg-amber-500/10 dark:bg-amber-500/20";
    scoreBorder = "border-amber-500/30";
  }
  if (result.toLowerCase().includes("moderate")) {
    scoreColor = "text-orange-500";
    scoreBg = "bg-orange-500/10 dark:bg-orange-500/20";
    scoreBorder = "border-orange-500/30";
  }
  if (result.toLowerCase().includes("severe")) {
    scoreColor = "text-rose-500";
    scoreBg = "bg-rose-500/10 dark:bg-rose-500/20";
    scoreBorder = "border-rose-500/30";
  }

  const description = testData.scoring[Object.keys(testData.scoring).find(range => {
    const [min, max] = range.split('-').map(Number);
    return score >= min && score <= max;
  }) || "0-0"]?.description || "No description available.";


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-3xl mx-auto"
    >
      <GlassCard className="overflow-hidden" hover={false}>
        <div className="p-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold font-headline">
              <GradientText colors={['#7c3aed', '#ec4899']}>
                Your Results
              </GradientText>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{testData.name}</p>
          </div>

          <div className={cn("relative p-10 rounded-[2.5rem] text-center border overflow-hidden", scoreBg, scoreBorder)}>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Activity className="h-40 w-40" />
            </div>

            <div className="relative z-10 space-y-4">
              <p className="text-slate-500 dark:text-slate-300 font-medium uppercase tracking-widest text-sm">Mental Health Score</p>
              <div className="flex items-center justify-center gap-2">
                <span className={cn("text-8xl font-black font-headline tabular-nums", scoreColor)}>{score}</span>
                <span className="text-2xl font-bold text-slate-400 mt-8">/ {maxScore}</span>
              </div>
              <div className={cn("inline-block px-6 py-2 rounded-full font-bold text-lg", scoreColor, "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm")}>
                {result}
              </div>
            </div>

            <div className="mt-8 px-4">
              <div className="h-3 bg-white/30 dark:bg-slate-700/50 rounded-full overflow-hidden">
                <motion.div
                  className={cn("h-full", scoreColor.replace("text-", "bg-"))}
                  initial={{ width: 0 }}
                  animate={{ width: `${(score / maxScore) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/40 dark:bg-slate-800/40 p-6 rounded-2xl border border-white/20 dark:border-slate-700/30">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-500" />
              What this means for you
            </h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <Link href="/dashboard/booking">
                <CalendarCheck className="mr-2 h-5 w-5" /> Book Counselor
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 h-14 text-lg font-bold border-2 rounded-2xl">
              <Link href="/dashboard/resources">
                <BookOpen className="mr-2 h-5 w-5" /> View Resources
              </Link>
            </Button>
          </div>

          <div className="flex justify-center">
            <Button onClick={onReset} variant="ghost" className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
              <RefreshCw className="mr-2 h-4 w-4" /> Take Another Test
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
