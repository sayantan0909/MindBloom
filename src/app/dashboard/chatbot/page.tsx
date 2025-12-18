import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatInterface } from "./chat-interface";
import { Bot } from "lucide-react";

export default function ChatbotPage() {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col">
       <div className="text-center mb-4">
             <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
                <Bot className="h-10 w-10 text-primary" />
             </div>
            <h1 className="text-3xl md:text-4xl font-bold font-headline">AI-Driven Chatbot</h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-3xl mx-auto">
                Your confidential space to talk. I'm here to offer support, suggest coping strategies, and guide you to resources.
            </p>
        </div>
      <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-3xl h-full flex flex-col shadow-2xl">
              <CardHeader>
                  <CardTitle>MindBloom AI Assistant</CardTitle>
                  <CardDescription>This is a safe space. All conversations are confidential.</CardDescription>
              </CardHeader>
              <ChatInterface />
          </Card>
      </div>
    </div>
  );
}
