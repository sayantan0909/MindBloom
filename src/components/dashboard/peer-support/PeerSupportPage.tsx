'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Brain, BookOpen, Heart, Moon, Sparkles } from 'lucide-react';
import { SUPPORT_ROOMS } from '@/types/peer-support';

import { usePeerMatching } from './hooks/usePeerMatching';
import { usePeerChat } from './hooks/usePeerChat';
import { useAiChat } from './hooks/useAiChat';

import { HomeView } from './views/HomeView';
import { RoomSelectView } from './views/RoomSelectView';
import { MatchingView } from './views/MatchingView';
import { ChatView } from './views/ChatView';

const supabase: any = createClient();

type ViewType = 'home' | 'room-select' | 'matching' | 'ai-chat' | 'live-chat';
type SupportRoom = typeof SUPPORT_ROOMS[number];

export default function PeerSupportOrchestrator() {
    const [currentView, setCurrentView] = useState<ViewType>('home');
    const [selectedRoom, setSelectedRoom] = useState<SupportRoom | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isAiMode, setIsAiMode] = useState(false);
    const [showPeerNotification, setShowPeerNotification] = useState(false);
    const [isSupportMode, setIsSupportMode] = useState(false);
    const [sessionTime, setSessionTime] = useState(1500);
    const [firstMessage, setFirstMessage] = useState('');
    const [inputValue, setInputValue] = useState('');

    // Hooks
    const {
        waitingChats,
        isLoadingWaiting,
        isJoining,
        fetchWaiting,
        handleRoomSelect,
        joinChat
    } = usePeerMatching(userId, currentView);

    const {
        messages,
        setMessages,
        isTyping,
        sendMessage,
        sendTypingIndicator
    } = usePeerChat(chatId, userId);

    const {
        chatHistory,
        setChatHistory,
        isAiTyping,
        sendAiMessage
    } = useAiChat(chatId, userId, selectedRoom?.id);

    // Get current user
    useEffect(() => {
        supabase.auth.getUser().then(({ data }: any) => {
            setUserId(data.user?.id || null);
        });
    }, []);

    // Timer
    useEffect(() => {
        if (currentView === 'live-chat' && sessionTime > 0) {
            const timer = setInterval(() => setSessionTime(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [currentView, sessionTime]);

    // Real-time matching listener
    useEffect(() => {
        if (!chatId || currentView !== 'matching') return;
        const channel = supabase.channel(`match:${chatId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'peer_support_chats',
                filter: `id=eq.${chatId}`
            }, (payload: any) => {
                if (payload.new.status === 'active') {
                    setCurrentView('live-chat');
                    setIsAiMode(false);
                    // Sync messages
                    supabase.from('peer_support_messages')
                        .select('*')
                        .eq('chat_id', chatId)
                        .order('created_at', { ascending: true })
                        .then(({ data }: any) => setMessages(data || []));
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [chatId, currentView]);

    // Background matching listener (if in AI mode)
    useEffect(() => {
        if (!chatId || !isAiMode) return;
        const channel = supabase.channel(`bg-match:${chatId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'peer_support_chats',
                filter: `id=eq.${chatId}`
            }, (payload: any) => {
                if (payload.new.status === 'active' && payload.new.recipient_id !== userId) {
                    setShowPeerNotification(true);
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [chatId, isAiMode, userId]);

    const onRoomSelect = async (room: SupportRoom) => {
        setSelectedRoom(room);
        setCurrentView('matching');
        const data = await handleRoomSelect(room.id, firstMessage);
        setChatId(data.chat_id);

        if (data.matched) {
            setIsAiMode(false);
            const { data: msgs } = await supabase.from('peer_support_messages').select('*').eq('chat_id', data.chat_id).order('created_at', { ascending: true });
            setMessages(msgs || []);
            setCurrentView('live-chat');
        } else {
            setTimeout(async () => {
                const { data: latestChat } = await supabase.from('peer_support_chats').select('status').eq('id', data.chat_id).single();
                if (latestChat?.status === 'active') return;

                setIsAiMode(true);
                setCurrentView('ai-chat');
                const welcome = "No peers are available right now, but I'm here to listen. What's on your mind?";
                setChatHistory([{ id: 'welcome', sender: 'ai', content: welcome }]);
                await supabase.from('peer_support_messages').insert({ chat_id: data.chat_id, sender_type: 'ai', content: welcome });
            }, 3000);
        }
    };

    const onJoinChat = async (chat: any) => {
        const { status, data } = await joinChat(chat.id, chat.room_id);
        if (status === 410) return alert('Peer no longer available.');
        if (data.matched) {
            setChatId(data.chat_id);
            setIsAiMode(false);
            setSelectedRoom(SUPPORT_ROOMS.find(r => r.id === chat.room_id) || null);
            const { data: msgs } = await supabase.from('peer_support_messages').select('*').eq('chat_id', data.chat_id).order('created_at', { ascending: true });
            setMessages(msgs || []);
            setCurrentView('live-chat');
        } else {
            alert(data.error || 'Failed to join.');
        }
    };

    const onSendMessage = async () => {
        if (!inputValue.trim()) return;
        const content = inputValue;
        setInputValue('');

        if (isAiMode) {
            await sendAiMessage(content);
        } else {
            await sendMessage(content);
        }
    };

    const onInputChange = (val: string) => {
        setInputValue(val);
        sendTypingIndicator(val.length > 0);
    };

    const onEndSession = async () => {
        if (confirm('End session?')) {
            if (chatId) await supabase.from('peer_support_chats').update({ status: 'ended', ended_at: new Date().toISOString() }).eq('id', chatId);
            setCurrentView('home');
            setChatId(null);
            setMessages([]);
            setChatHistory([]);
        }
    };

    const getIconComponent = (id: string) => {
        if (id.includes('academic')) return BookOpen;
        if (id.includes('anxiety')) return Brain;
        if (id.includes('loneliness')) return Heart;
        if (id.includes('sleep')) return Moon;
        return Sparkles;
    };

    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    // Rendering
    if (currentView === 'home') {
        return (
            <HomeView
                userId={userId}
                isSupportMode={isSupportMode}
                setIsSupportMode={setIsSupportMode}
                waitingChats={waitingChats}
                isLoadingWaiting={isLoadingWaiting}
                isJoining={isJoining}
                onRefresh={fetchWaiting}
                onStartConnection={() => setCurrentView('room-select')}
                onJoinChat={onJoinChat}
                getIconComponent={getIconComponent}
            />
        );
    }

    if (currentView === 'room-select') {
        return (
            <RoomSelectView
                firstMessage={firstMessage}
                setFirstMessage={setFirstMessage}
                onBack={() => setCurrentView('home')}
                onRoomSelect={onRoomSelect}
                getIconComponent={getIconComponent}
            />
        );
    }

    if (currentView === 'matching') {
        return <MatchingView selectedRoom={selectedRoom} />;
    }

    return (
        <ChatView
            messages={messages}
            chatHistory={chatHistory}
            isAiMode={isAiMode}
            userId={userId}
            isTyping={isTyping}
            isAiTyping={isAiTyping}
            inputValue={inputValue}
            sessionTime={sessionTime}
            showPeerNotification={showPeerNotification}
            onInputChange={onInputChange}
            onSendMessage={onSendMessage}
            onEndSession={onEndSession}
            onSwitchToPeer={async () => {
                setIsAiMode(false);
                setShowPeerNotification(false);
                // Load all messages for this chat (including AI ones)
                const { data: msgs } = await supabase
                    .from('peer_support_messages')
                    .select('*')
                    .eq('chat_id', chatId)
                    .order('created_at', { ascending: true });
                setMessages(msgs || []);
            }}
            onCloseNotification={() => setShowPeerNotification(false)}
            formatTime={formatTime}
        />
    );
}
