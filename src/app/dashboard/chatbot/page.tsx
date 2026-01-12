'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hi, I’m MindBloom 🌱\nYour confidential space to talk. How are you feeling today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            message: input, 
            history: messages.map(m => ({role: m.role, content: m.content})) 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Use data.error from the server's JSON response
        throw new Error(data.error || 'Failed to get AI response.');
      }
      
      if (data.reply) {
        setMessages((prev) => [...prev, { role: 'model', content: data.reply }]);
      } else {
        throw new Error("AI response was empty.");
      }

    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = { role: 'model', content: error.message || "I'm here. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
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
          <div className="flex-grow flex flex-col">
            <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                    {message.role === 'model' && (
                      <Avatar className="w-8 h-8 bg-primary/20 text-primary">
                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn('max-w-sm md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 whitespace-pre-wrap', message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none')}>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback><User size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                 {isLoading && (
                   <div className='flex items-start gap-3 justify-start'>
                      <Avatar className="w-8 h-8 bg-primary/20 text-primary">
                          <AvatarFallback><Bot size={20} /></AvatarFallback>
                      </Avatar>
                      <div className='max-w-sm md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3 bg-card border rounded-bl-none flex items-center'>
                          <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                   </div>
                )}
              </div>
            </ScrollArea>
            <div className='p-4 border-t'>
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type how you're feeling..."
                  autoComplete="off"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
