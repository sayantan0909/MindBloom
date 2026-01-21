import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase: any = createClient();

export function useAiChat(chatId: string | null, userId: string | null, roomId?: string) {
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const [isAiTyping, setIsAiTyping] = useState(false);

    const sendAiMessage = async (content: string) => {
        setIsAiTyping(true);

        // Local user message
        const userMsg = { id: Date.now().toString(), sender: 'user', content };
        setChatHistory(prev => [...prev, userMsg]);

        // Persist user message
        if (chatId && userId) {
            await supabase.from('peer_support_messages').insert({
                chat_id: chatId,
                sender_id: userId,
                sender_type: 'user',
                content
            });
        }

        try {
            const response = await fetch('/api/peer-support/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    room_id: roomId,
                    history: chatHistory
                })
            });

            const data = await response.json();
            const aiMsgContent = data.response || data.fallback;
            const aiMsg = { id: (Date.now() + 1).toString(), sender: 'ai', content: aiMsgContent };

            setChatHistory(prev => [...prev, aiMsg]);

            // Persist AI message
            if (chatId) {
                await supabase.from('peer_support_messages').insert({
                    chat_id: chatId,
                    sender_type: 'ai',
                    content: aiMsgContent
                });
            }

            return aiMsg;
        } catch (error) {
            console.error('AI Chat Error:', error);
            const errAiMsg = { id: 'err', sender: 'ai', content: "I'm still here to listen." };
            setChatHistory(prev => [...prev, errAiMsg]);
            return errAiMsg;
        } finally {
            setIsAiTyping(false);
        }
    };

    return {
        chatHistory,
        setChatHistory,
        isAiTyping,
        sendAiMessage
    };
}
