import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { SUPPORT_ROOMS } from '@/types/peer-support';

const supabase: any = createClient();

export function usePeerMatching(userId: string | null, currentView: string) {
    const [waitingChats, setWaitingChats] = useState<any[]>([]);
    const [isLoadingWaiting, setIsLoadingWaiting] = useState(false);
    const [isJoining, setIsJoining] = useState(false);

    const fetchWaiting = async () => {
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

    const joinChat = async (chatId: string, roomId: string) => {
        setIsJoining(true);
        try {
            const response = await fetch('/api/peer-support/match', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    room_id: roomId,
                    chat_id: chatId // Fixed to use chat_id as per latest user update
                })
            });
            return { status: response.status, data: await response.json() };
        } finally {
            setIsJoining(false);
        }
    };

    return {
        waitingChats,
        isLoadingWaiting,
        isJoining,
        fetchWaiting,
        handleRoomSelect,
        joinChat
    };
}
