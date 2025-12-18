import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Bot, ClipboardList, BookOpen } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline text-foreground">Welcome back, Student.</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Remember, taking care of your mind is a journey, not a destination. We're here to support you every step of the way.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-headline text-2xl">Mental Health Screening</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Check in with yourself. Take a confidential screening test for anxiety or depression.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full">
              <Link href="/dashboard/screening">
                Start a Screening <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-headline text-2xl">Resource Hub</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Explore a curated library of articles, videos, audios, and games for your well-being.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full">
              <Link href="/dashboard/resources">
                Explore Resources <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="font-headline text-2xl">AI-Powered Chatbot</CardTitle>
            </div>
            <CardDescription className="pt-2">
              Need to talk? Our friendly chatbot is here to listen and provide support 24/7.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex items-end">
            <Button asChild className="w-full">
              <Link href="/dashboard/chatbot">
                Start Chatting <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
