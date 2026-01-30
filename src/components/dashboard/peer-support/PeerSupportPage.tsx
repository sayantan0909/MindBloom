'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, MessageCircle, Users, CheckCircle, Info, X, Brain, BookOpen, Heart, Moon, Sparkles, Send, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SUPPORT_ROOMS } from '@/types/peer-support';
import type { PeerSupportMessage } from '@/types/peer-support';
import { motion, AnimatePresence } from 'framer-motion';
import { GradientText } from '@/components/ui/gradient-text';
import { GlassCard } from '@/components/dashboard/glass-card';

const supabase: any = createClient();

type ViewType = 'home' | 'room-select' | 'matching' | 'ai-chat' | 'live-chat';
type SupportRoom = typeof SUPPORT_ROOMS[number];

export default function PeerSupportPage() {
    const router = useRouter();
    const [currentView, setCurrentView] = useState<ViewType>('home');
    const [selectedRoom, setSelectedRoom] = useState<SupportRoom | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<PeerSupportMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAiMode, setIsAiMode] = useState(false);
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [showPeerNotification, setShowPeerNotification] = useState(false);
    const [waitingChats, setWaitingChats] = useState<any[]>([]);
    const [isSupportMode, setIsSupportMode] = useState(false);
    const [isLoadingWaiting, setIsLoadingWaiting] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [sessionTime, setSessionTime] = useState(1500);
    const [firstMessage, setFirstMessage] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [initiatorId, setInitiatorId] = useState<string | null>(null);


    // Get current user
    useEffect(() => {
        const getUser = async () => {
            console.log('🔐 Fetching Supabase user...');
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('❌ Error fetching user:', error);
            } else {
                console.log('✅ Supabase user loaded:', user?.id);
                setUserId(user?.id || null);
            }
        };
        getUser();
    }, []);

    // Fetch waiting chats for "Support Others" dashboard
    useEffect(() => {
        const fetchWaiting = async () => {
            if (currentView !== 'home' || !userId) return;

            setIsLoadingWaiting(true);
            console.log('🔄 Fetching waiting peers...', { userId });

            try {
                const { data, error } = await supabase
                    .from('peer_support_chats')
                    .select('*')
                    .eq('status', 'waiting')
                    .neq('initiator_id', userId)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error('❌ Error fetching waiting chats:', error);
                } else {
                    console.log('✅ Fetched waiting chats:', data?.length);
                    setWaitingChats(data || []);
                }
            } catch (err) {
                console.error('❌ Unexpected error in fetchWaiting:', err);
            } finally {
                setIsLoadingWaiting(false);
            }
        };

        if (currentView === 'home' && userId) {
            fetchWaiting();

            const channel = supabase
                .channel('waiting-chats-home')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'peer_support_chats'
                }, (payload: any) => {
                    console.log('🔔 Waiting chats update:', payload.eventType);
                    fetchWaiting();
                })
                .subscribe((status: string) => {
                    console.log('📡 Home channel status:', status);
                });

            return () => {
                console.log('🔌 Cleaning up home channel');
                supabase.removeChannel(channel);
            };
        }
    }, [currentView, userId]);

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, chatHistory, isTyping]);

    // Timer for live chat
    useEffect(() => {
        if (currentView === 'live-chat' && sessionTime > 0) {
            const timer = setInterval(() => {
                setSessionTime(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [currentView, sessionTime]);

    // 🔥 CRITICAL: Real-time message & typing subscription
    useEffect(() => {
        if (!chatId || !userId) {
            console.log('⏸️ Realtime listener not started (missing chatId or userId)', { chatId, userId });
            return;
        }

        console.log('🔌 Starting realtime listener for chat:', chatId, 'userId:', userId);

        const channel = supabase.channel(`chat:${chatId}`);

        // Listen for NEW messages
        channel.on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'peer_support_messages',
                filter: `chat_id=eq.${chatId}`
            },
            (payload: { new: PeerSupportMessage }) => {
                const newMessage = payload.new;
                console.log('🔔 Realtime message received:', {
                    messageId: newMessage.id,
                    senderId: newMessage.sender_id,
                    currentUserId: userId,
                    isOwnMessage: newMessage.sender_id === userId,
                    senderType: newMessage.sender_type,
                    contentPreview: newMessage.content.substring(0, 50) + '...'
                });

                // Only add if it's NOT from current user (avoid duplicates)
                if (newMessage.sender_id !== userId) {

                    // 🛑 Stop Duplicate AI Messages: Explicitly ignore AI messages in live chat
                    if (newMessage.sender_type === 'ai') {
                        console.log('🤖 Ignoring AI message in realtime (handled separately)');
                        return;
                    }

                    console.log('✅ Adding peer message to state');
                    setMessages(prev => {
                        // Prevent duplicates
                        if (prev.find(m => m.id === newMessage.id)) {
                            console.log('⚠️ Message already exists, skipping');
                            return prev;
                        }
                        return [...prev, newMessage];
                    });

                    // If we're in AI mode and receive a user message, show notification
                    if (isAiMode && newMessage.sender_type === 'user') {
                        console.log('🔔 Peer joined while in AI mode!');
                        setShowPeerNotification(true);
                    }
                } else {
                    console.log('⏭️ Skipping own message (already in state via optimistic update)');
                }
            }
        );

        // Listen for typing events
        channel.on('broadcast', { event: 'typing' }, ({ payload }: { payload: any }) => {
            console.log('⌨️ Typing indicator:', payload);
            if (payload.userId !== userId) {
                setIsTyping(payload.isTyping);
            }
        });

        // Listen for chat status changes
        channel.on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'peer_support_chats',
                filter: `id=eq.${chatId}`
            },
            (payload: any) => {
                console.log('🔔 Chat status update:', payload.new);

                if (payload.new.status === 'active' && isAiMode && payload.new.recipient_id !== userId) {
                    console.log('🎉 Peer joined!');
                    setShowPeerNotification(true);
                }

                // If we're in matching mode and status becomes active, transition to live chat
                if (currentView === 'matching' && payload.new.status === 'active') {
                    console.log('✅ Transitioning to live chat');
                    setCurrentView('live-chat');
                    setIsAiMode(false);

                    // Load messages
                    // Load messages (filter out AI)
                    supabase.from('peer_support_messages')
                        .select('*')
                        .eq('chat_id', chatId)
                        .neq('sender_type', 'ai')
                        .order('created_at', { ascending: true })
                        .then(({ data }: any) => {
                            console.log('📨 Loaded messages on transition:', data?.length);
                            setMessages(data || []);
                        });

                    // Fetch initiator info
                    supabase.from('peer_support_chats')
                        .select('initiator_id')
                        .eq('id', chatId)
                        .single()
                        .then(({ data }: any) => {
                            if (data) setInitiatorId(data.initiator_id);
                        });
                }
            }
        );

        channel.subscribe((status: string) => {
            console.log('📡 Realtime channel status:', status);
        });

        return () => {
            console.log('🔌 Cleaning up realtime listener for chat:', chatId);
            supabase.removeChannel(channel);
        };
    }, [chatId, userId, isAiMode, currentView]);

    // Handle typing indicator
    const handleInputChange = (val: string) => {
        setInputValue(val);

        if (chatId) {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

            const channel = supabase.channel(`chat:${chatId}`);
            channel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId, isTyping: true },
            });

            typingTimeoutRef.current = setTimeout(() => {
                channel.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { userId, isTyping: false },
                });
            }, 3000);
        }
    };

    const switchToPeer = async () => {
        console.log('🔄 Switching from AI to peer...');
        setIsAiMode(false);
        setShowPeerNotification(false);
        setCurrentView('live-chat');

        // Load messages (filter out AI messages so they don't duplicate)
        const { data: msgs } = await supabase
            .from('peer_support_messages')
            .select('*')
            .eq('chat_id', chatId)
            .neq('sender_type', 'ai')
            .order('created_at', { ascending: true });

        console.log('📨 Loaded messages for peer chat:', msgs?.length);
        setMessages(msgs || []);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getIconComponent = (roomId: string) => {
        if (roomId.includes('academic')) return BookOpen;
        if (roomId.includes('anxiety')) return Brain;
        if (roomId.includes('loneliness')) return Heart;
        if (roomId.includes('sleep')) return Moon;
        return Sparkles;
    };

    const handleRoomSelect = async (room: SupportRoom) => {
        setSelectedRoom(room);
        setCurrentView('matching');

        try {
            console.log('🚀 Starting match request...', { room_id: room.id, first_message: firstMessage });

            const response = await fetch('/api/peer-support/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: room.id,
                    first_message: firstMessage.trim() || null
                })
            });

            const data = await response.json();
            console.log('✅ Match response:', data);

            if (data.matched) {
                // Immediately matched with peer
                console.log('🎉 Instantly matched!');
                setChatId(data.chat_id);
                setIsAiMode(false);

                // Load existing messages
                const { data: msgs } = await supabase
                    .from('peer_support_messages')
                    .select('*')
                    .eq('chat_id', data.chat_id)
                    .neq('sender_type', 'ai')
                    .order('created_at', { ascending: true });

                console.log('📨 Loaded messages:', msgs?.length);
                setMessages(msgs || []);
                setCurrentView('live-chat');
                setInitiatorId(userId); // I created it -> I am initiator
            } else {
                // No peer available - wait then offer AI
                console.log('⏳ No peer available, waiting...');
                setChatId(data.chat_id);
                setInitiatorId(userId); // I created it

                setTimeout(async () => {
                    // Check if matched in background
                    const { data: latestChat } = await supabase
                        .from('peer_support_chats')
                        .select('status')
                        .eq('id', data.chat_id)
                        .single();

                    if (latestChat?.status === 'active') {
                        console.log('✅ Matched in background!');
                        return;
                    }

                    console.log('🤖 Activating AI mode...');
                    setCurrentView('ai-chat');
                    setIsAiMode(true);

                    const welcomeMsg = "No peers are available right now, but I'm here to listen. What's on your mind?";
                    setChatHistory([{
                        id: 'welcome',
                        sender: 'ai',
                        content: welcomeMsg
                    }]);

                    // Persist welcome message
                    if (data.chat_id) {
                        await supabase.from('peer_support_messages').insert({
                            chat_id: data.chat_id,
                            sender_type: 'ai',
                            content: welcomeMsg
                        });
                    }
                }, 3000);
            }
        } catch (error) {
            console.error('❌ Matching error:', error);
        }
    };

    const handleJoinChat = async (chat: any) => {
        setIsJoining(true);
        try {
            console.log('🤝 Attempting to join chat:', chat.id);

            const response = await fetch('/api/peer-support/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: chat.room_id,
                    chat_id: chat.id
                })
            });

            const data = await response.json();
            console.log('✅ Join response:', data);

            if (response.status === 409) {
                console.warn('⚠️ Chat already taken');
                alert('This chat was already claimed by another listener.');
                return;
            }

            if (data.matched) {
                console.log('🎉 Successfully joined chat!');
                setChatId(data.chat_id);
                setIsAiMode(false);
                setSelectedRoom(SUPPORT_ROOMS.find(r => r.id === chat.room_id) || null);

                // Load messages
                const { data: msgs } = await supabase
                    .from('peer_support_messages')
                    .select('*')
                    .eq('chat_id', data.chat_id)
                    .neq('sender_type', 'ai')
                    .order('created_at', { ascending: true });

                console.log('📨 Loaded messages:', msgs?.length);
                setMessages(msgs || []);
                setCurrentView('live-chat');
                setInitiatorId(chat.initiator_id); // Chat object has initiator_id
            } else {
                alert(data.error || 'Failed to join chat.');
            }
        } catch (err) {
            console.error('❌ Join error:', err);
            alert('Failed to join chat. Please try again.');
        } finally {
            setIsJoining(false);
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMsgContent = inputValue;
        const localUserMsg = {
            id: Date.now().toString(),
            sender: 'user',
            sender_id: userId,
            sender_type: 'user',
            content: userMsgContent,
            created_at: new Date().toISOString()
        };

        console.log('📨 SENDING MESSAGE:', {
            content: userMsgContent.substring(0, 50),
            chatId,
            userId,
            isAiMode
        });

        if (isAiMode) {
            // AI mode
            setChatHistory(prev => [...prev, localUserMsg]);
            setInputValue('');
            setIsTyping(true);

            if (chatId) {
                await supabase.from('peer_support_messages').insert({
                    chat_id: chatId,
                    sender_id: userId,
                    sender_type: 'user',
                    content: userMsgContent
                });
            }

            try {
                const response = await fetch('/api/peer-support/ai-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: userMsgContent,
                        room_id: selectedRoom?.id,
                        history: chatHistory
                    })
                });

                const data = await response.json();
                setIsTyping(false);

                const aiMsgContent = data.response || data.fallback;
                const aiMessage = {
                    id: (Date.now() + 1).toString(),
                    sender: 'ai',
                    sender_type: 'ai',
                    content: aiMsgContent
                };
                setChatHistory(prev => [...prev, aiMessage]);

                if (chatId) {
                    await supabase.from('peer_support_messages').insert({
                        chat_id: chatId,
                        sender_type: 'ai',
                        content: aiMsgContent
                    });
                }
            } catch (error) {
                setIsTyping(false);
                console.error('❌ AI error:', error);
            }
        } else {
            // Peer-to-peer mode
            if (!chatId || !userId) {
                console.error('❌ Cannot send: missing chatId or userId', { chatId, userId });
                return;
            }

            setInputValue('');

            // Optimistic UI update
            console.log('📝 Adding message to state (optimistic):', localUserMsg);
            setMessages(prev => [...prev, localUserMsg as any]);

            const { data: newMessage, error } = await supabase
                .from('peer_support_messages')
                .insert({
                    chat_id: chatId,
                    sender_id: userId,
                    sender_type: 'user',
                    content: userMsgContent
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Send error:', error);
            } else {
                console.log('✅ Message saved to DB:', newMessage.id);
            }
        }
    };

    const handleEndSession = async () => {
        if (confirm('Are you sure you want to end this session?')) {
            console.log('🛑 Ending session...');
            if (chatId) {
                await supabase.from('peer_support_chats').update({
                    status: 'ended',
                    ended_at: new Date().toISOString()
                }).eq('id', chatId);
            }
            setCurrentView('home');
            setMessages([]);
            setChatHistory([]);
            setChatId(null);
            setIsAiMode(false);
            setSelectedRoom(null);
            setSessionTime(1500);
            setFirstMessage('');
            setInitiatorId(null);
        }
    };

    // 🖼️ Render messages with debugging
    const displayMessages = isAiMode ? chatHistory : messages;

    console.log('🖼️ Rendering UI:', {
        view: currentView,
        messageCount: displayMessages.length,
        isAiMode,
        chatId,
        userId
    });

    if (currentView === 'home') {
        return (
            <div className="flex flex-col gap-6 max-w-5xl mx-auto p-4 md:p-8">
                {/* Header */}
                <div className="text-center space-y-3 mb-8">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                        <GradientText>Peer Support</GradientText>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                        Connect anonymously with fellow students who understand what you're going through.
                    </p>
                </div>

                {/* Mode Toggles */}
                <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl mx-auto border border-slate-200 dark:border-slate-700/50 relative">


                    <button
                        onClick={() => setIsSupportMode(false)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${!isSupportMode
                            ? 'bg-white dark:bg-slate-700 shadow-md text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Heart className="h-4 w-4" />
                        Get Support
                    </button>
                    <button
                        onClick={() => setIsSupportMode(true)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold ${isSupportMode
                            ? 'bg-white dark:bg-slate-700 shadow-md text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Users className="h-4 w-4" />
                        Support Others
                    </button>
                </div>

                {/* Dynamic Content */}
                {!isSupportMode ? (
                    // SEEKER VIEW
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        {SUPPORT_ROOMS.map((room) => {
                            const Icon = getIconComponent(room.id);
                            return (
                                <GlassCard
                                    key={room.id}
                                    className="group hover:scale-[1.02] transition-all cursor-pointer border-l-4 border-l-indigo-500"
                                    onClick={() => handleRoomSelect(room as any)}
                                >
                                    <div className="p-4 space-y-4">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                                            <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{room.name}</h3>
                                            <p className="text-xs text-slate-500 mt-1">{room.description}</p>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                ) : (
                    // LISTENER VIEW
                    <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b">
                            <h2 className="font-bold text-xl flex items-center gap-2">
                                Waiting for Support
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                    {waitingChats.length}
                                </Badge>
                            </h2>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (userId) { // Trigger fetch
                                        setUserId(userId);
                                    }
                                }}
                                className={isLoadingWaiting ? 'animate-spin' : ''}
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>

                        {waitingChats.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200">
                                <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="font-bold text-slate-500">No one is waiting right now</h3>
                                <p className="text-sm text-slate-400">Check back in a few minutes</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {waitingChats.map(chat => {
                                    const room = SUPPORT_ROOMS.find(r => r.id === chat.room_id);
                                    const Icon = getIconComponent(chat.room_id || '');

                                    return (
                                        <GlassCard key={chat.id} className="border-l-4 border-l-emerald-500">
                                            <div className="p-5 space-y-4">
                                                <div className="flex items-start justify-between">
                                                    <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                                                        {room?.name || 'General Support'}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>

                                                {chat.first_message && (
                                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-3 rounded-lg text-sm text-slate-700 dark:text-slate-300 italic relative">
                                                        <span className="absolute -top-2 -left-1 text-2xl text-emerald-200">"</span>
                                                        {chat.first_message}
                                                    </div>
                                                )}

                                                <Button
                                                    onClick={() => handleJoinChat(chat)}
                                                    disabled={isJoining}
                                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                                                >
                                                    {isJoining ? (
                                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Joining...</>
                                                    ) : (
                                                        'Accept & Listen'
                                                    )}
                                                </Button>
                                            </div>
                                        </GlassCard>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (currentView === 'matching') {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="h-32 w-32 rounded-full border-4 border-indigo-100 dark:border-indigo-900/30 animate-[ping_3s_linear_infinite]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-24 w-24 rounded-full bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-200 dark:shadow-none">
                            <Users className="h-10 w-10 text-white animate-pulse" />
                        </div>
                    </div>
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Finding a Peer...
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        We're connecting you with someone who can listen.
                        If no one is available in 5 seconds, our AI companion will join you.
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => setCurrentView('home')}
                    className="mt-8 rounded-full px-8"
                >
                    Cancel
                </Button>
            </div>
        );
    }

    if (currentView === 'room-select') {
        // This state is now handled inside HomeView logically in this merged file, 
        // but if you have a separate flow, keeps it distinct.
        // For this merged file, I'll rely on the Home View room click to trigger 'matching'.
        return <div>Loading...</div>;
    }



    // CHAT VIEW (AI or Live)
    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl backdrop-blur-xl relative">
            {/* Header */}
            <header className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border-b border-white/20 p-6 z-10 shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleEndSession}
                            className="text-slate-600 dark:text-slate-300"
                        >
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-2xl ${isAiMode ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                                {isAiMode ? <Brain className="h-7 w-7 text-white" /> : <Users className="h-7 w-7 text-white" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-2xl">
                                    {isAiMode ? 'AI Care Companion' : 'Live Peer Chat'}
                                </h3>
                                <div className="text-sm text-slate-500">
                                    {isAiMode ? 'Powered by Gemini' : (
                                        <div className="flex items-center gap-2">
                                            <span>Session: {formatTime(sessionTime)}</span>
                                            {initiatorId && (
                                                <Badge variant="outline" className="text-[10px] h-5">
                                                    {initiatorId === userId ? 'You started' : 'Peer started'}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {displayMessages.map((msg: any, index: number) => {
                    const isUser = msg.sender === 'user' || msg.sender_id === userId;

                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[75%] rounded-2xl p-5 ${isUser
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white'
                                }`}>
                                <p>{msg.content}</p>
                                <span className="text-xs opacity-70">
                                    {new Date(msg.created_at || Date.now()).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4">
                            <div className="flex gap-1.5">
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <footer className="p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-t border-white/20">
                <div className="flex gap-4">
                    <Input
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="flex-1 h-14 px-6 rounded-2xl"
                    />
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="h-14 w-14 rounded-2xl bg-indigo-600"
                    >
                        <Send className="h-6 w-6" />
                    </Button>
                </div>
            </footer>
        </div>
    );
}

