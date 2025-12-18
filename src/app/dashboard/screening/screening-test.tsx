'use client';

import { useState } from 'react';
import { mentalHealthData, ScreeningQuestion } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

type TestType = 'phq9' | 'gad7';

export function ScreeningTest() {
  const [currentTest, setCurrentTest] = useState<TestType | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [score, setScore] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const startTest = (type: TestType) => {
    setCurrentTest(type);
    setScore(null);
    setResult(null);
    setAnswers({});
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: parseInt(value, 10) }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTest) return;

    const testData = mentalHealthData[currentTest];
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
  };
  
  const resetTest = () => {
    setCurrentTest(null);
    setScore(null);
    setResult(null);
    setAnswers({});
  };

  if (score !== null && result && currentTest) {
    const testData = mentalHealthData[currentTest];
    const maxScore = testData.questions.length * 3;
    const severity = result.split(' ')[0].toLowerCase();
    
    let scoreColor = "text-green-600";
    if (severity.includes("mild")) scoreColor = "text-yellow-600";
    if (severity.includes("moderate")) scoreColor = "text-orange-600";
    if (severity.includes("severe")) scoreColor = "text-red-600";

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-headline">Screening Results</CardTitle>
                <CardDescription>{testData.name}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground">Your Score</p>
                <p className={`text-7xl font-bold ${scoreColor}`}>{score}</p>
                <p className="text-xl font-semibold mt-2">{result}</p>
                <Progress value={(score / maxScore) * 100} className="mt-4" />
                <div className="text-left mt-6 bg-secondary/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">What this might mean:</h4>
                    <p className="text-muted-foreground">This screening suggests you may be experiencing <strong>{result.toLowerCase()}</strong> symptoms. This is not a diagnosis. For a formal diagnosis and treatment options, please consult a healthcare professional.</p>
                    {score >= 10 && (
                        <p className="font-semibold text-primary mt-3">We recommend speaking with a mental health professional to discuss your results.</p>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button onClick={resetTest} className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" /> Take Another Screening
                </Button>
            </CardFooter>
        </Card>
    );
  }

  if (currentTest) {
    const testData = mentalHealthData[currentTest];
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = testData.questions.length;

    return (
      <Card className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <Button variant="ghost" size="sm" onClick={resetTest} className="absolute top-4 left-4 h-8 w-8 p-0">
               <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-center pt-8">
                <CardTitle className="text-2xl font-headline">{testData.name}</CardTitle>
                <CardDescription>{testData.purpose}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <Progress value={(answeredCount / totalQuestions) * 100} />
            {testData.questions.map((q: ScreeningQuestion) => (
              <div key={q.id}>
                <p className="font-medium mb-4">{q.id}. {q.text}?</p>
                <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)} required className="flex flex-col sm:flex-row sm:justify-between sm:gap-4 space-y-2 sm:space-y-0">
                  {testData.responses.map(r => (
                    <Label key={r.value} className="flex items-center space-x-2 border p-3 rounded-md hover:bg-accent hover:text-accent-foreground has-[input:checked]:bg-primary has-[input:checked]:text-primary-foreground has-[input:checked]:border-primary flex-1 cursor-pointer">
                      <RadioGroupItem value={r.value.toString()} id={`${q.id}-${r.value}`} />
                      <span>{r.text}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={answeredCount < totalQuestions} className="w-full">
              View Results
            </Button>
          </CardFooter>
        </form>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <Card className="text-center p-6 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-semibold font-headline">Depression (PHQ-9)</h3>
          <p className="text-muted-foreground mt-2">Screen for symptoms of depression over the last 2 weeks.</p>
        </div>
        <Button onClick={() => startTest('phq9')} className="mt-6">Start PHQ-9 Test</Button>
      </Card>
      <Card className="text-center p-6 flex flex-col justify-between">
        <div>
            <h3 className="text-2xl font-semibold font-headline">Anxiety (GAD-7)</h3>
            <p className="text-muted-foreground mt-2">Screen for symptoms of generalized anxiety disorder.</p>
        </div>
        <Button onClick={() => startTest('gad7')} className="mt-6">Start GAD-7 Test</Button>
      </Card>
    </div>
  );
}
