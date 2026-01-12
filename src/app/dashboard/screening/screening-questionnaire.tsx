'use client';

import { useState } from 'react';
import { ScreeningTool } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, RefreshCw, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';

interface ScreeningQuestionnaireProps {
  testData: ScreeningTool;
  onComplete: () => void;
  onBack: () => void;
}

export function ScreeningQuestionnaire({ testData, onComplete, onBack }: ScreeningQuestionnaireProps) {
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);

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
        interpretation = testData.scoring[range];
        break;
      }
    }
    setScore(totalScore);
    setResult(interpretation);
    onComplete();
  };

  const resetTest = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setScore(null);
    setResult(null);
  }

  if (score !== null && result) {
    const maxScore = totalQuestions * (testData.responses.length - 1);
    const severity = result.split(' ')[0].toLowerCase();
    
    let scoreColor = "text-green-600";
    if (severity.includes("mild")) scoreColor = "text-yellow-600";
    if (severity.includes("moderate")) scoreColor = "text-orange-600";
    if (severity.includes("severe")) scoreColor = "text-red-600";

    return (
        <Card className="max-w-2xl mx-auto shadow-2xl">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Screening Results</CardTitle>
                <CardDescription>{testData.name}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}>
                    <p className="text-muted-foreground">Your Score</p>
                    <p className={`text-7xl font-bold ${scoreColor}`}>{score}</p>
                    <p className="text-xl font-semibold mt-2">{result}</p>
                    <Progress value={(score / maxScore) * 100} className="mt-4" />
                </motion.div>
                <div className="text-left mt-6 bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">What this might mean:</h4>
                    <p className="text-muted-foreground">This screening suggests you may be experiencing <strong>{result.toLowerCase()}</strong> symptoms. This is not a diagnosis. For a formal diagnosis and treatment options, please consult a healthcare professional.</p>
                    {score >= 10 && (
                        <p className="font-semibold text-primary mt-3">We recommend speaking with a mental health professional to discuss your results.</p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                <Button onClick={onBack} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Take Another Screening
                </Button>
            </CardFooter>
        </Card>
    );
  }


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
