import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatInput } from '@/ai/flows/ai-driven-chatbot';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ reply: 'Message is required' }, { status: 400 });
    }

    const chatInput: ChatInput = { message, history };
    const chatOutput = await chat(chatInput);

    if (chatOutput.error) {
      throw new Error(chatOutput.error);
    }
    
    return NextResponse.json({ reply: chatOutput.response });

  } catch (error: any) {
    console.error('API Route Error:', error);
    if (error.message?.includes('The AI assistant is currently experiencing high demand')) {
      return NextResponse.json({ reply: error.message }, { status: 503 });
    }
    return NextResponse.json({ reply: "I'm here with you. It seems something went wrong on my end, but I'm here to listen." }, { status: 500 });
  }
}
