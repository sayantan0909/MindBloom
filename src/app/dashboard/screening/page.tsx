import { ScreeningTest } from './screening-test';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export default function ScreeningPage() {
  return (
    <div>
        <div className="text-center mb-8">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <ClipboardList className="h-10 w-10 text-primary" />
             </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Mental Health Screening</h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto">
                These brief, confidential screenings are tools to help you understand your emotional well-being. They are not a diagnosis but can be a helpful first step.
            </p>
        </div>
      <ScreeningTest />
    </div>
  );
}
