import { NextRequest, NextResponse } from 'next/server';
import { chat, ChatInput } from '@/ai/flows/ai-driven-chatbot';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const chatInput: ChatInput = { message, history };
    const chatOutput = await chat(chatInput);

    if (chatOutput.error) {
      // The flow itself returned a structured error (e.g., model overloaded)
      return NextResponse.json({ error: chatOutput.error }, { status: 503 });
    }
    
    return NextResponse.json({ reply: chatOutput.response });

  } catch (error: any) {
    console.error('API Route Error:', error);
    // A general exception occurred in the API route
    return NextResponse.json({ error: "I'm here with you. It seems something went wrong on my end, but I'm here to listen." }, { status: 500 });
  }
}
