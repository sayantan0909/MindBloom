import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { PeerSupportMessage } from '@/types/peer-support';

const supabase: any = createClient();

export function usePeerChat(chatId: string | null, userId: string | null) {
    const [messages, setMessages] = useState<PeerSupportMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!chatId || !userId) return;

        const channel = supabase.channel(`chat:${chatId}`);

        channel.on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'peer_support_messages',
                filter: `chat_id=eq.${chatId}`
            },
            (payload: { new: PeerSupportMessage }) => {
                if (payload.new.sender_id !== userId) {
                    setMessages(prev => [...prev, payload.new]);
                }
            }
        )
            .on('broadcast', { event: 'typing' }, ({ payload }: any) => {
                if (payload.userId !== userId) {
                    setIsTyping(payload.isTyping);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatId, userId]);

    const sendMessage = async (content: string) => {
        if (!chatId || !userId) return;

        const { data, error } = await supabase
            .from('peer_support_messages')
            .insert({
                chat_id: chatId,
                sender_id: userId,
                sender_type: 'user',
                content
            })
            .select()
            .single();

        if (error) throw error;
        setMessages(prev => [...prev, data]);
        return data;
    };

    const sendTypingIndicator = (isTyping: boolean) => {
        if (!chatId) return;
        const channel = supabase.channel(`chat:${chatId}`);
        channel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId, isTyping },
        });
    };

    return {
        messages,
        setMessages,
        isTyping,
        sendMessage,
        sendTypingIndicator
    };
}
