import { NextResponse } from 'next/server';
import { chat } from '@/ai/flows/ai-driven-chatbot';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const result = await chat({ message });

    return NextResponse.json({
      response: result.response,
    });
  } catch (error) {
    console.error('Chat API error:', error);

    return NextResponse.json(
      {
        response:
          "I’m here with you 🌱 Something went wrong, but you’re not alone.",
      },
      { status: 500 }
    );
  }
}
