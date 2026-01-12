import { chat } from '@/ai/flows/ai-driven-chatbot';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const aiResponse = await chat({ message, history });

    if (aiResponse.error) {
      console.error('AI Error:', aiResponse.error);
      return NextResponse.json({ reply: aiResponse.error }, { status: 500 });
    }

    return NextResponse.json({ reply: aiResponse.response });

  } catch (e: any) {
    console.error('API Route Error:', e);
    return NextResponse.json({ reply: 'Something went wrong.' }, { status: 500 });
  }
}
