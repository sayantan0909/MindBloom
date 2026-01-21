'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, User, Send, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/dashboard/glass-card';
import { GradientText } from '@/components/ui/gradient-text';

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
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          history: nextMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.response) {
        setMessages(prev => [
          ...prev,
          {
            role: 'model',
            content:
              "I’m here with you 🌱 Something went wrong, but you’re not alone.",
          },
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: 'model', content: data.response },
        ]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content:
            "I’m here with you 🌱 Something went wrong, but you’re not alone.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 md:px-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col space-y-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="mx-auto bg-gradient-to-br from-pink-500 to-rose-600 p-6 rounded-[2rem] w-fit shadow-2xl shadow-rose-500/20"
          >
            <Bot className="h-12 w-12 text-white" />
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            <GradientText colors={['#ec4899', '#f43f5e', '#a855f7']}>
              AI Companion
            </GradientText>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Your confidential, high-fidelity space to talk. I'm here to offer empathetic support and guide you to resources.
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-grow flex flex-col max-w-4xl mx-auto w-full"
        >
          <GlassCard className="flex-grow h-[600px] flex flex-col border-white/60 dark:border-slate-700/60 rounded-[2.5rem] shadow-2xl relative overflow-hidden" hover={false}>
            {/* Chat Top Bar */}
            <div className="px-6 py-4 border-b border-white/20 dark:border-slate-700/20 flex items-center justify-between bg-white/20 dark:bg-slate-900/20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">MindBloom AI</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Encrypted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div
              ref={scrollAreaRef}
              className="flex-grow overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
            >
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex items-end gap-3",
                      message.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <Avatar className={cn(
                      "w-8 h-8 border shadow-sm",
                      message.role === 'user' ? "bg-white dark:bg-slate-800" : "bg-gradient-to-tr from-pink-500 to-rose-500"
                    )}>
                      <AvatarFallback className="bg-transparent">
                        {message.role === 'user' ? <User className="h-4 w-4 text-slate-600 dark:text-slate-300" /> : <Bot className="h-4 w-4 text-white" />}
                      </AvatarFallback>
                    </Avatar>

                    <div className={cn(
                      "max-w-[80%] px-5 py-3 rounded-2xl shadow-sm text-sm leading-relaxed",
                      message.role === 'user'
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-white/20 dark:border-slate-700/20 rounded-bl-none backdrop-blur-sm"
                    )}>
                      {message.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-2xl rounded-bl-none border border-white/20 dark:border-slate-700/20">
                    <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-white/20 dark:border-slate-700/20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
              <form
                onSubmit={handleSendMessage}
                className="relative flex items-center gap-3"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-500">
                  <Sparkles className="h-5 w-5 opacity-50" />
                </div>
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="flex-grow h-14 pl-12 pr-20 rounded-2xl border-2 border-white/40 dark:border-slate-700/40 bg-white/60 dark:bg-slate-800/60 focus-visible:ring-rose-500 focus-visible:border-rose-500 dark:text-white transition-all shadow-inner"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg active:scale-95 transition-all"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
              <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <ShieldCheck className="h-3 w-3" />
                Secure & Anonymous Channel
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
