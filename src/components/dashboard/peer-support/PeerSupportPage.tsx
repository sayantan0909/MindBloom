'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SUPPORT_ROOMS } from '@/types/peer-support';
import { BookOpen, Brain, Heart, Moon, Sparkles } from 'lucide-react';

// Views
import { HomeView } from './views/HomeView';
import { MatchingView } from './views/MatchingView';
import { ChatView } from './views/ChatView';
import { RoomSelectView } from './views/RoomSelectView';

// Hooks
import { usePeerMatching } from './hooks/usePeerMatching';
import { usePeerChat } from './hooks/usePeerChat';
import { useAiChat } from './hooks/useAiChat';

const supabase: any = createClient();

type ViewType = 'home' | 'room-select' | 'matching' | 'chat';

export default function PeerSupportPage() {
    // Basic State
    const [userId, setUserId] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<ViewType>('home');
    const [isSupportMode, setIsSupportMode] = useState(false);

    // Chat Session State
    const [selectedRoom, setSelectedRoom] = useState<typeof SUPPORT_ROOMS[number] | null>(null);
    const [chatId, setChatId] = useState<string | null>(null);
    const [isAiMode, setIsAiMode] = useState(false);
    const [sessionTime, setSessionTime] = useState(1500); // 25 minutes
    const [inputValue, setInputValue] = useState('');
    const [firstMessage, setFirstMessage] = useState('');
    const [showPeerNotification, setShowPeerNotification] = useState(false);

    // Hooks
    const {
        waitingChats,
        isLoadingWaiting,
        isJoiningChat,
        fetchWaiting,
        handleRoomSelect: matchRoom,
        joinChat: attemptJoinChat
    } = usePeerMatching(userId, currentView);

    const {
        messages,
        setMessages, // Exposed to clear or manually set
        isTyping,
        sendMessage: sendPeerMessage,
        sendTypingIndicator
    } = usePeerChat(chatId, userId);

    const {
        chatHistory,
        setChatHistory,
        isAiTyping,
        sendAiMessage
    } = useAiChat(chatId, userId, selectedRoom?.id);

    // Initial Auth
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUserId(user?.id || null);
        };
        getUser();
    }, []);

    // Handlers
    const handleEndSession = useCallback(async () => {
        if (window.confirm('Are you sure you want to end the session?')) {
            if (chatId) {
                await supabase.from('peer_support_chats')
                    .update({ status: 'ended', ended_at: new Date().toISOString() })
                    .eq('id', chatId);
            }
            // Cleanup
            setChatId(null);
            setMessages([]);
            setChatHistory([]);
            setInputValue('');
            setFirstMessage('');
            setIsAiMode(false);
            setCurrentView('home');
        }
    }, [chatId, setMessages, setChatHistory]);

    // Timer Logic
    useEffect(() => {
        if (currentView === 'chat' && !isAiMode && sessionTime > 0) {
            const timer = setInterval(() => {
                setSessionTime(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (sessionTime === 0 && currentView === 'chat') {
            handleEndSession();
        }
    }, [currentView, isAiMode, sessionTime, handleEndSession]);

    // Listener for "Peer Joined" notification while in AI mode
    useEffect(() => {
        if (!chatId || !isAiMode || currentView !== 'chat') return;

        const channel = supabase.channel(`room-status-${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'peer_support_chats',
                    filter: `id=eq.${chatId}`
                },
                (payload: any) => {
                    if (payload.new.status === 'active' && payload.new.recipient_id !== userId) {
                        setShowPeerNotification(true);
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [chatId, isAiMode, currentView, userId]);


    const getIconComponent = (roomId: string) => {
        if (roomId.includes('academic')) return BookOpen;
        if (roomId.includes('anxiety')) return Brain;
        if (roomId.includes('loneliness')) return Heart;
        if (roomId.includes('sleep')) return Moon;
        return Sparkles;
    };

    const handleRoomSelect = async (room: typeof SUPPORT_ROOMS[number]) => {
        setSelectedRoom(room);
        setCurrentView('matching');
        setSessionTime(1500);

        try {
            // Initiate match
            const data = await matchRoom(room.id, firstMessage);

            if (data.matched) {
                // Instant match
                setChatId(data.chat_id);
                setIsAiMode(false);
                setCurrentView('chat');
            } else {
                // Wait for peer
                setChatId(data.chat_id);
                // After 5s, offer AI if still waiting
                setTimeout(async () => {
                    // Check if matched in background
                    const { data: latest } = await supabase
                        .from('peer_support_chats')
                        .select('status')
                        .eq('id', data.chat_id)
                        .single();

                    if (latest && latest.status === 'active') {
                        setIsAiMode(false);
                        setCurrentView('chat');
                        return;
                    }

                    // Fallback to AI
                    setIsAiMode(true);
                    setCurrentView('chat');
                    setChatHistory([{
                        id: 'welcome',
                        sender: 'ai',
                        content: "No peers are available right now, but I'm here to listen. What's on your mind?"
                    }]);
                }, 5000);
            }
        } catch (error) {
            console.error('Matching failed', error);
            setCurrentView('home');
        }
    };

    const handleJoinChat = async (chat: any) => {
        const result = await attemptJoinChat(chat.id, chat.room_id);
        if (result.status === 200 && result.data.matched) {
            setChatId(result.data.chat_id);
            setIsAiMode(false);
            setCurrentView('chat');
            setSessionTime(1500);

            const room = SUPPORT_ROOMS.find(r => r.id === chat.room_id) || null;
            setSelectedRoom(room);
        } else if (result.status === 409) {
            alert('This chat was just taken by someone else.');
            fetchWaiting();
        } else {
            alert('Could not join chat.');
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;
        const txt = inputValue;
        setInputValue('');

        if (isAiMode) {
            await sendAiMessage(txt);
        } else {
            await sendPeerMessage(txt);
        }
    };

    const handleInputChange = (val: string) => {
        setInputValue(val);
        if (!isAiMode) {
            sendTypingIndicator(true);
        }
    };



    const handleSwitchToPeer = async () => {
        setShowPeerNotification(false);
        setIsAiMode(false);
        // Messages will automatically load via usePeerChat subscription (since chatId is same)
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
                isJoiningChat={isJoiningChat}
                onRefresh={fetchWaiting}
                onStartConnection={() => setCurrentView('room-select')}
                onJoinChat={handleJoinChat}
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
                onRoomSelect={handleRoomSelect}
                getIconComponent={getIconComponent}
            />
        );
    }

    if (currentView === 'matching') {
        return <MatchingView onCancel={() => setCurrentView('home')} />;
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
            onInputChange={handleInputChange}
            onSendMessage={handleSendMessage}
            onEndSession={handleEndSession}
            onSwitchToPeer={handleSwitchToPeer}
            onCloseNotification={() => setShowPeerNotification(false)}
            formatTime={formatTime}
        />
    );
}
