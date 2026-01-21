import { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { ChatHeader } from '../components/ChatHeader';
import { MessageBubble } from '../components/MessageBubble';
import { TypingIndicator } from '../components/TypingIndicator';
import { ChatInput } from '../components/ChatInput';

interface ChatViewProps {
    messages: any[];
    chatHistory: any[];
    isAiMode: boolean;
    userId: string | null;
    isTyping: boolean;
    isAiTyping: boolean;
    inputValue: string;
    sessionTime: number;
    showPeerNotification: boolean;
    onInputChange: (val: string) => void;
    onSendMessage: () => void;
    onEndSession: () => void;
    onSwitchToPeer: () => void;
    onCloseNotification: () => void;
    formatTime: (s: number) => string;
}

export function ChatView({
    messages,
    chatHistory,
    isAiMode,
    userId,
    isTyping,
    isAiTyping,
    inputValue,
    sessionTime,
    showPeerNotification,
    onInputChange,
    onSendMessage,
    onEndSession,
    onSwitchToPeer,
    onCloseNotification,
    formatTime
}: ChatViewProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const displayMessages = isAiMode ? chatHistory : messages;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayMessages, isTyping, isAiTyping]);

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col bg-white/80 dark:bg-gray-900/80 rounded-[2rem] overflow-hidden border border-slate-200 dark:border-gray-800 shadow-2xl backdrop-blur-xl relative">
            {/* Background Peer Notification */}
            {showPeerNotification && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-500 px-4 w-full max-w-md">
                    <Card className="border-2 border-emerald-500 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-gray-800 p-5 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-1">
                            <Button variant="ghost" size="icon" onClick={onCloseNotification} className="h-6 w-6 rounded-full opacity-50 hover:opacity-100">×</Button>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
                                <Heart className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-lg font-bold dark:text-white">A Peer Listener is Here!</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">A real student has joined the room. Would you like to switch?</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button onClick={onSwitchToPeer} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-emerald-600/20">Connect with Peer</Button>
                            <Button variant="outline" onClick={onCloseNotification} className="flex-1 font-bold h-12 rounded-xl border-2">Stay with AI</Button>
                        </div>
                    </Card>
                </div>
            )}

            <ChatHeader
                isAiMode={isAiMode}
                sessionTime={sessionTime}
                formatTime={formatTime}
                onEndSession={onEndSession}
            />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-gray-900/30">
                {displayMessages.map((msg: any) => (
                    <MessageBubble key={msg.id} msg={msg} userId={userId} />
                ))}

                {(isTyping || isAiTyping) && <TypingIndicator />}

                <div ref={messagesEndRef} className="h-4" />
            </div>

            <ChatInput
                inputValue={inputValue}
                onInputChange={onInputChange}
                onSendMessage={onSendMessage}
                disabled={false}
            />
        </div>
    );
}
