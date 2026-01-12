'use client';

import { useState, useRef, useEffect, useTransition, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chat } from '@/ai/flows/ai-driven-chatbot';
import { Bot, User, Loader2, Send } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useCollection } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, where, Firestore } from 'firebase/firestore';

type Message = {
  id: string;
  role: 'user' | 'bot' | 'model';
  content: string;
  timestamp?: any;
};

const initialMessages: Omit<Message, 'id'>[] = [
  {
    role: 'bot',
    content: "Hello! I'm MindBloom, an AI assistant. I'm here to provide mental health support and resources. How are you feeling today?",
  },
];

const quickMessages = [
    "I'm feeling anxious.",
    "I think I'm depressed.",
    "I need coping strategies.",
    "Tell me about stress.",
];

type ChatHistoryProps = {
  user: NonNullable<ReturnType<typeof useUser>['user']>;
  firestore: Firestore;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  messages: Message[];
  isPending: boolean;
};

function ChatHistory({ user, firestore, messages, setMessages, isPending }: ChatHistoryProps) {
  const messagesQuery = useMemo(() => {
    return query(
      collection(firestore, 'chatMessages'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'asc')
    );
  }, [user.uid, firestore]);

  const { data: initialDbMessages, isLoading: isLoadingMessages } = useCollection<Omit<Message, 'id'>>(messagesQuery);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialDbMessages) {
      const mappedMessages = initialDbMessages.map(m => ({ ...m, role: m.role === 'model' ? 'bot' : m.role })) as Message[];
      if (mappedMessages.length === 0 && !isLoadingMessages) {
        setMessages(initialMessages.map(m => ({ ...m, id: Math.random().toString() })));
      } else {
        setMessages(mappedMessages);
      }
    } else if (!isLoadingMessages) {
      setMessages(initialMessages.map(m => ({ ...m, id: Math.random().toString() })));
    }
  }, [initialDbMessages, isLoadingMessages, setMessages]);
  
  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
             viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages, isPending]);

  return (
    <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
      <div className="space-y-6">
        {isLoadingMessages && messages.length === 0 && (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}
        {messages.map((message) => (
          <div key={message.id} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
            {message.role === 'bot' && (
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
  );
}


export function ChatInterface() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [messages, setMessages] = useState<Message[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  const handleFormAction = async (formData: FormData) => {
    const userInput = formData.get('message') as string;
    if (!userInput || !user || !firestore) return;

    formRef.current?.reset();
    
    const userMessage: Omit<Message, 'id'> = { role: 'user', content: userInput, timestamp: serverTimestamp() };
    
    // Optimistically update UI
    startTransition(async () => {
      setMessages(prev => [...prev, { ...userMessage, id: Date.now().toString() }]);

      // Save user message to Firestore
      const userMessageForDb = { ...userMessage, userId: user.uid };
      const userMessagePromise = addDoc(collection(firestore, 'chatMessages'), userMessageForDb);

      // Get chat history from state, ensuring it's up-to-date
      const chatHistory = [...messages, { ...userMessage, id: 'temp-id' }]
        .slice(-10)
        .map(m => ({ role: m.role === 'bot' ? 'model' : 'user', content: m.content }));
      
      const result = await chat({ message: userInput, history: chatHistory });

      if (result.response) {
        const botMessage: Omit<Message, 'id'> = { role: 'bot', content: result.response, timestamp: serverTimestamp() };
        setMessages(prev => [...prev, { ...botMessage, id: (Date.now() + 1).toString() }]);
        const botMessageForDb = { content: result.response, role: 'model', userId: user.uid, timestamp: serverTimestamp() };
        await addDoc(collection(firestore, 'chatMessages'), botMessageForDb);
      } else if (result.error) {
        const errorMessage: Omit<Message, 'id'> = { role: 'bot', content: result.error, timestamp: serverTimestamp() };
        setMessages(prev => [...prev, { ...errorMessage, id: (Date.now() + 1).toString() }]);
      }

      await userMessagePromise; // Ensure user message is saved
    });
  };

  const handleQuickMessage = (message: string) => {
    const formData = new FormData();
    formData.append('message', message);
    startTransition(() => {
      handleFormAction(formData);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {user && firestore ? (
        <ChatHistory 
          user={user} 
          firestore={firestore} 
          messages={messages}
          setMessages={setMessages}
          isPending={isPending}
        />
      ) : (
         <ScrollArea className="flex-grow p-4">
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
         </ScrollArea>
      )}
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
            action={handleFormAction}
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
