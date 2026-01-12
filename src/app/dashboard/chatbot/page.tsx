'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, ShieldAlert } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp, query, where, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

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
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;

    if (user && firestore) {
      setIsHistoryLoading(true);
      const messagesQuery = query(
        collection(firestore, 'chatMessages'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'asc')
      );

      unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const dbMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            role: data.role === 'model' || data.role === 'bot' ? 'ai' : 'user',
            content: data.content,
          };
        });
        setMessages(dbMessages);
        setIsHistoryLoading(false);
      }, (error) => {
        console.error("Firestore snapshot error:", error);
        setIsHistoryLoading(false);
      });
    } else {
      setIsHistoryLoading(false);
    }
    
    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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
    
    // Optimistically add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessageContent }]);
    setInput('');
    
    // Save user message to Firestore
    try {
        await addDoc(collection(firestore, 'chatMessages'), {
            role: 'user',
            content: userMessageContent,
            userId: user.uid,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error saving user message:", error);
        // Optionally handle this error, e.g., show a toast
    }

    // Set loading state for AI response
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageContent,
          history: messages.slice(-10).map(m => ({ role: m.role === 'ai' ? 'model' : 'user', content: m.content })) 
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get AI response.');
      }

      const data = await res.json();
      
      if (data.reply) {
         await addDoc(collection(firestore, 'chatMessages'), {
            role: 'model',
            content: data.reply,
            userId: user.uid,
            timestamp: serverTimestamp(),
        });
      } else {
        throw new Error("AI response was empty.");
      }

    } catch (error) {
      console.error(error);
      const errorMessageContent = 'Sorry, I had trouble responding. Please try again.';
       await addDoc(collection(firestore, 'chatMessages'), {
        role: 'model',
        content: errorMessageContent,
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderChatContent = () => {
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Please Log In</h3>
                <p className="text-muted-foreground mt-2">
                    You need to be signed in to view your chat history and talk with the AI assistant.
                </p>
            </div>
        );
    }

    if (isHistoryLoading) {
      return (
         <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      );
    }

    return (
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
    );
  }

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
              {renderChatContent()}
            </ScrollArea>
            <div className='p-4 border-t'>
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={user ? "Type your message..." : "Please log in to chat"}
                  autoComplete="off"
                  disabled={isLoading || !user || !firestore}
                />
                <Button type="submit" disabled={isLoading || !input.trim() || !user || !firestore}>
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
