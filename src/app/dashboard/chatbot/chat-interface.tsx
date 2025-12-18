'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chat } from '@/ai/flows/ai-driven-chatbot';
import { Bot, User, Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useFormStatus } from 'react-dom';

type Message = {
  id: number;
  type: 'user' | 'bot';
  text: string;
};

const initialMessages: Message[] = [
  {
    id: 1,
    type: 'bot',
    text: "Hello! I'm here to provide mental health support and resources. How are you feeling today?",
  },
];

const quickMessages = [
    "I'm feeling anxious.",
    "I think I'm depressed.",
    "I need coping strategies.",
    "Tell me about stress.",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    async (_: any, formData: FormData) => {
      const userInput = formData.get('message') as string;
      if (!userInput) return null;

      formRef.current?.reset();
      setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userInput }]);
      
      const result = await chat({ message: userInput });

      if (result.response) {
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: result.response! }]);
      } else if (result.error) {
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: result.error }]);
      }
      
      return null;
    },
    null
  );
  
  const handleQuickMessage = (message: string) => {
    const formData = new FormData();
    formData.append('message', message);
    formAction(formData);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={cn('flex items-start gap-3', message.type === 'user' ? 'justify-end' : 'justify-start')}>
              {message.type === 'bot' && (
                <Avatar className="w-8 h-8 bg-primary/20 text-primary">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div className={cn('max-w-sm md:max-w-md lg:max-w-lg rounded-2xl px-4 py-3', message.type === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none')}>
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              {message.type === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isPending && (
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
         <div className="flex gap-2 mb-2 flex-wrap">
              {quickMessages.map((qm) => (
                  <Button key={qm} variant="outline" size="sm" onClick={() => handleQuickMessage(qm)} disabled={isPending}>
                      {qm}
                  </Button>
              ))}
          </div>
        <form 
            ref={formRef}
            action={formAction}
            className="flex items-center gap-2"
        >
          <Input name="message" placeholder="Type your message..." autoComplete="off" disabled={isPending} />
          <Button type="submit" disabled={isPending}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
