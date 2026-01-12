'use client';

import { useState } from 'react';
import { ScreeningTool } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, RefreshCw, ChevronRight, BookOpen, CalendarCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
    <Card className="max-w-2xl mx-auto shadow-2xl overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="h-8 w-8 p-0">
               <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-center">
                <CardTitle className="text-xl md:text-2xl font-headline">{testData.name}</CardTitle>
            </div>
            <div className="w-8"></div>
        </div>
        <div className="mt-4 space-y-2">
            <p className="text-center text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            <Progress value={((currentQuestionIndex + 1) / totalQuestions) * 100} className="w-full h-2" />
        </div>
      </CardHeader>
      <div className="relative h-64">
        <AnimatePresence mode="wait">
            <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute w-full"
            >
              <CardContent className="space-y-4 px-6 md:px-8">
                <p className="font-medium text-lg text-center h-16 flex items-center justify-center">{currentQuestion.text}?</p>
                <RadioGroup 
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    value={answers[currentQuestion.id]?.toString()}
                    className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 space-y-2 sm:space-y-0"
                >
                  {testData.responses.map(r => (
                    <Label key={r.value} className="flex items-center justify-center space-x-2 border p-3 rounded-md hover:bg-accent hover:text-accent-foreground has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary flex-1 cursor-pointer transition-colors duration-200">
                      <RadioGroupItem value={r.value.toString()} id={`${currentQuestion.id}-${r.value}`} />
                      <span>{r.text}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </motion.div>
        </AnimatePresence>
      </div>
      <CardFooter>
        <Button onClick={handleNext} disabled={answers[currentQuestion.id] === undefined} className="w-full">
            {isLastQuestion ? 'View Results' : 'Next'} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
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
    
    let scoreColor = "text-green-600";
    let bgColor = "bg-green-100/50";
    if (result.toLowerCase().includes("mild")) {
        scoreColor = "text-yellow-600";
        bgColor = "bg-yellow-100/50";
    }
    if (result.toLowerCase().includes("moderate")) {
        scoreColor = "text-orange-600";
        bgColor = "bg-orange-100/50";
    }
    if (result.toLowerCase().includes("severe")) {
        scoreColor = "text-red-600";
        bgColor = "bg-red-100/50";
    }

    const description = testData.scoring[Object.keys(testData.scoring).find(range => {
        const [min, max] = range.split('-').map(Number);
        return score >= min && score <= max;
    }) || "0-0"]?.description || "No description available.";


    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="max-w-2xl mx-auto shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-headline">Screening Results</CardTitle>
                    <CardDescription>{testData.name}</CardDescription>
                </CardHeader>
                <CardContent className={cn("text-center p-6 rounded-lg m-6", bgColor)}>
                    <p className="text-muted-foreground">Your Score</p>
                    <p className={`text-7xl font-bold ${scoreColor}`}>{score}</p>
                    <p className="text-xl font-semibold mt-2">{result}</p>
                    <Progress value={(score / maxScore) * 100} className="mt-4" />
                </CardContent>
                <CardContent>
                    <div className="text-left mt-0 bg-secondary/50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">What this might mean:</h4>
                        <p className="text-muted-foreground">{description}</p>
                    </div>
                </CardContent>
                <CardFooter className="flex-col sm:flex-row gap-2">
                    <Button asChild className="w-full sm:w-auto flex-1">
                        <Link href="/dashboard/booking">
                            <CalendarCheck className="mr-2 h-4 w-4" /> Book Counselor
                        </Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full sm:w-auto flex-1">
                        <Link href="/dashboard/resources">
                            <BookOpen className="mr-2 h-4 w-4" /> View Resources
                        </Link>
                    </Button>
                     <Button onClick={onReset} variant="outline" className="w-full sm:w-auto flex-1">
                        <RefreshCw className="mr-2 h-4 w-4" /> Take Another Test
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
