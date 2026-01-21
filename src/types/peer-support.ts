// P2P Support System Type Definitions

export interface PeerSupportChat {
    id: string;
    room_id: string;
    initiator_id: string;
    recipient_id: string | null;
    status: 'waiting' | 'active' | 'ended';
    created_at: string;
    ended_at: string | null;
    last_message_at: string | null;
}

export interface PeerSupportMessage {
    id: string;
    chat_id: string;
    sender_id: string | null;
    sender_type: 'user' | 'ai' | 'system';
    content: string;
    created_at: string;
}

// Support room definitions
export const SUPPORT_ROOMS = [
    {
        id: 'academic-stress',
        name: 'Academic Stress',
        description: 'Exams, deadlines, pressure',
        color: 'from-blue-500/20 to-indigo-500/20',
        borderColor: 'border-blue-500/30',
    },
    {
        id: 'anxiety-overthinking',
        name: 'Anxiety & Overthinking',
        description: 'Racing thoughts, worry, social anxiety',
        color: 'from-purple-500/20 to-pink-500/20',
        borderColor: 'border-purple-500/30',
    },
    {
        id: 'loneliness-isolation',
        name: 'Loneliness & Isolation',
        description: 'Feeling disconnected, missing home',
        color: 'from-rose-500/20 to-orange-500/20',
        borderColor: 'border-rose-500/30',
    },
    {
        id: 'sleep-burnout',
        name: 'Sleep & Burnout',
        description: 'Insomnia, exhaustion, burnout',
        color: 'from-indigo-500/20 to-cyan-500/20',
        borderColor: 'border-indigo-500/30',
    },
    {
        id: 'emotional-support',
        name: 'Emotional Support',
        description: 'I just need someone to talk to',
        color: 'from-amber-500/20 to-yellow-500/20',
        borderColor: 'border-amber-500/30',
    },
] as const;

export type RoomId = typeof SUPPORT_ROOMS[number]['id'];
