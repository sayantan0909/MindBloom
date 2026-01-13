'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse } from "lucide-react";
import { ExpressionAnalyzer } from './expression-analyzer';

export default function ExpressionAnalysisPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <HeartPulse className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">AI Expression Analysis</CardTitle>
          <CardDescription className="text-base">
            Let's check your current stress level. This tool will use your device's camera for a few seconds to analyze your facial cues. 
            Your privacy is paramount—no data is stored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpressionAnalyzer />
        </CardContent>
      </Card>
    </div>
  );
}
