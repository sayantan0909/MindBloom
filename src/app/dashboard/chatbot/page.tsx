'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot } from 'firebase/firestore';

type Message = {
  id?: string;
  role: 'user' | 'ai';
  content: string;
};

export default function ChatbotPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || !firestore) return;

    const messagesQuery = query(
      collection(firestore, 'chatMessages'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const dbMessages: Message[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          role: data.role === 'model' || data.role === 'bot' ? 'ai' : 'user',
          content: data.content,
        };
      });
      setMessages(dbMessages);
    });

    return () => unsubscribe();
  }, [user, firestore]);

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
    if (!input.trim() || !user || !firestore) return;

    const userMessageContent = input;
    setInput('');
    setIsLoading(true);

    const userMessage: Omit<Message, 'id'> = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]); // Optimistically update UI

    await addDoc(collection(firestore, 'chatMessages'), {
      role: 'user',
      content: userMessageContent,
      userId: user.uid,
      timestamp: serverTimestamp(),
    });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageContent,
          history: messages.slice(-10) // Send last 10 messages as history
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get AI response.');
      }

      const data = await res.json();

      await addDoc(collection(firestore, 'chatMessages'), {
        role: 'model',
        content: data.reply,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
      const errorMessage = { role: 'ai' as const, content: 'Sorry, I had trouble responding. Please try again.' };
       await addDoc(collection(firestore, 'chatMessages'), {
        role: 'model',
        content: errorMessage.content,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
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
                    {message.role === 'ai' && (
                      <Avatar className="w-8 h-8 bg-primary/20 text-primary">
                        <AvatarFallback><Bot size={20} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div className={cn('max-w-sm md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3', message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none')}>
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
                  placeholder="Type your message..."
                  autoComplete="off"
                  disabled={isLoading || !user || !firestore}
                />
                <Button type="submit" disabled={isLoading || !user || !firestore}>
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