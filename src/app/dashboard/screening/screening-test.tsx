'use client';

import { useState } from 'react';
import { mentalHealthData, ScreeningTool } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScreeningQuestionnaire } from './screening-questionnaire';

type TestType = 'phq9' | 'gad7';

export function ScreeningTest() {
  const [currentTest, setCurrentTest] = useState<TestType | null>(null);
  const [testData, setTestData] = useState<ScreeningTool | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const startTest = (type: TestType) => {
    setCurrentTest(type);
    setTestData(mentalHealthData[type]);
    setIsCompleted(false);
  };
  
  const resetTest = () => {
    setCurrentTest(null);
    setTestData(null);
    setIsCompleted(false);
  };

  const handleComplete = () => {
    setIsCompleted(true);
  }

  if (currentTest && testData && !isCompleted) {
    return <ScreeningQuestionnaire testData={testData} onComplete={handleComplete} onBack={resetTest} />;
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
