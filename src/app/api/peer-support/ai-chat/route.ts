import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Room-specific context prompts
const ROOM_CONTEXTS: Record<string, string> = {
    'academic-stress': 'You are a supportive peer helping with academic stress, exam pressure, and study challenges.',
    'anxiety-overthinking': 'You are a supportive peer helping with anxiety, racing thoughts, and overthinking.',
    'loneliness-isolation': 'You are a supportive peer helping with loneliness, isolation, and feeling disconnected.',
    'sleep-burnout': 'You are a supportive peer helping with sleep issues, exhaustion, and burnout.',
    'emotional-support': 'You are a supportive peer providing general emotional support.'
};

export async function POST(request: Request) {
    try {
        const { message, room_id, history } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        // Build system prompt with room context
        const roomContext = ROOM_CONTEXTS[room_id] || ROOM_CONTEXTS['emotional-support'];
        const systemPrompt = `${roomContext}

IMPORTANT GUIDELINES:
- You are NOT a therapist or counselor, you're a supportive peer
- Be warm, empathetic, and non-judgmental
- Keep responses conversational and natural (2-4 sentences)
- Ask open-ended questions to encourage sharing
- Validate their feelings
- Never diagnose or give medical advice
- If they mention crisis/self-harm, immediately suggest professional help
- Use casual, friendly language like a college student would
- Don't be overly formal or clinical

Remember: You're a fellow student who cares and wants to listen.`;

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250,
            }
        });

        // Build conversation history
        const chatHistory = history?.map((msg: any) => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        })) || [];

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I\'ll be a supportive peer who listens with empathy and care.' }]
                },
                ...chatHistory
            ]
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({
            success: true,
            response: response.trim()
        });

    } catch (error) {
        console.error('Gemini AI error:', error);
        return NextResponse.json({
            error: 'AI temporarily unavailable',
            fallback: "I'm here to listen. Can you tell me more about what's going on?"
        }, { status: 500 });
    }
}
