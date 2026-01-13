'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface StressGameCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
}

export function StressGameCard({ title, description, icon: Icon, onClick }: StressGameCardProps) {
  return (
    <Card className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button onClick={onClick} className="w-full">
          Begin Exercise
        </Button>
      </CardFooter>
    </Card>
  );
}
