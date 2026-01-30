import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SUPPORT_ROOMS } from '@/types/peer-support';

const supabase: any = createClient();

export function usePeerMatching(userId: string | null, currentView: string) {
    const [waitingChats, setWaitingChats] = useState<any[]>([]);
    const [isLoadingWaiting, setIsLoadingWaiting] = useState(false);
    // const [joiningChats, setJoiningChats] = useState<Map<string, boolean>>(new Map());
    const attemptedJoinsRef = useRef<Set<string>>(new Set());
    const [joiningChatId, setJoiningChatId] = useState<string | null>(null);


    const fetchWaiting = async () => {
        // if (currentView !== 'home' || !userId) return;
        // if (currentView !== 'home' || !userId || joiningChats.size > 0) return;
        if (currentView !== 'home' || !userId) return;
        setIsLoadingWaiting(true);
        console.log('--- Fetching Waiting Peers ---', { userId });

        try {
            const { data, error } = await supabase
                .from('peer_support_chats')
                .select('*')
                .eq('status', 'waiting')
                .neq('initiator_id', userId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching waiting chats:', error);
            } else {
                console.log('Successfully fetched waiting chats:', data?.length);
                setWaitingChats(data || []);
            }
        } catch (err) {
            console.error('Unexpected error in fetchWaiting:', err);
        } finally {
            setIsLoadingWaiting(false);
        }
    };

    useEffect(() => {
        if (currentView === 'home' && userId) {
            fetchWaiting();

            const channel = supabase
                .channel('waiting-chats-home')
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'peer_support_chats'
                }, () => {
                    fetchWaiting();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [currentView, userId]);

    const handleRoomSelect = async (roomId: string, firstMessage: string) => {
        try {
            const response = await fetch('/api/peer-support/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: roomId,
                    first_message: firstMessage.trim() || null
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Matching error:', error);
            throw error;
        }
    };

    // const joinChat = async (chatId: string, roomId: string) => {
    //     // Prevent duplicate joins
    //     if (joiningChats.get(chatId)) {
    //         console.warn('Already joining chat:', chatId);
    //         return { status: 429, data: { error: 'Already joining this chat' } };
    //     }

    //     // Set joining state for this specific chat
    //     setJoiningChats(prev => {
    //         const next = new Map(prev);
    //         next.set(chatId, true);
    //         return next;
    //     });

    //     try {
    //         const response = await fetch('/api/peer-support/match', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify({
    //                 room_id: roomId,
    //                 chat_id: chatId
    //             })
    //         });
    //         // 
    //         const data = await response.json();
    //         if (response.status === 409) {
    //             return { status: 409, data: null }; // silent conflict
    //         }
    //         return { status: response.status, data };

    //     } finally {
    //         // Clear joining state for this chat
    //         setJoiningChats(prev => {
    //             const next = new Map(prev);
    //             next.delete(chatId);
    //             return next;
    //         });
    //     }
    // };
    const joinChat = async (chatId: string, roomId: string) => {
        // HARD BLOCK: never try same chat twice
        if (attemptedJoinsRef.current.has(chatId)) {
            return { status: 409, data: null };
        }

        attemptedJoinsRef.current.add(chatId);
        setJoiningChatId(chatId);

        try {
            const response = await fetch('/api/peer-support/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: roomId,
                    chat_id: chatId
                })
            });

            const data = await response.json();

            // 409 = final, do NOT retry
            if (response.status === 409) {
                return { status: 409, data: null };
            }

            return { status: response.status, data };
        } finally {
            setJoiningChatId(null);
        }
    };


    // const isJoiningChat = (chatId: string): boolean => {
    //     return joiningChats.get(chatId) || false;
    // };
    const isJoiningChat = (chatId: string): boolean => {
        return joiningChatId === chatId;
    };

    return {
        waitingChats,
        isLoadingWaiting,
        isJoiningChat,
        fetchWaiting,
        handleRoomSelect,
        joinChat
    };
}
