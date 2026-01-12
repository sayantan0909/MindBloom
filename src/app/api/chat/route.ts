import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are MindBloom 🌱, a gentle, calm, emotionally supportive companion.

Your role:
- Provide empathy, emotional support, and grounding responses.
- Always respond with natural, human language.
- Keep replies short, warm, and reassuring (2–5 sentences).
- Encourage reflection, comfort, or gentle next steps.

Important safety rules:
- You are NOT a doctor or medical professional.
- NEVER diagnose conditions or give medical treatment.
- If users mention physical discomfort or illness, respond with emotional support and general comfort suggestions only.
- Use phrases like:
  - "I’m not a medical professional, but..."
  - "It might help to..."
  - "You deserve care and rest."

Critical behavior rules (DO NOT BREAK):
- NEVER return an empty response.
- NEVER say "Please try again."
- NEVER refuse without offering emotional support.
- If unsure, respond with empathy instead of silence.

Conversation rules:
- Maintain context across messages.
- Assume the user is speaking casually and may misspell words.
- Gently rephrase or clarify without correcting harshly.

Tone:
- Warm, calm, non-judgmental.
- Like a caring friend who listens.
- Avoid technical or clinical language.

If a message is unclear:
- Respond with empathy first.
- Then ask a gentle follow-up question.
`
    });

    const chat = model.startChat({
        history: history || [],
        generationConfig: {
            maxOutputTokens: 1000,
        },
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json({ reply: text });

  } catch (error: any) {
    console.error('API Route Error:', error);
     if (error.message?.includes('503 Service Unavailable') || error.message?.includes('model is overloaded')) {
      return NextResponse.json({ reply: 'The AI assistant is currently experiencing high demand. Please try again in a moment.' }, { status: 503 });
    }
    return NextResponse.json({ reply: "I'm here with you. It sounds like something went wrong on my end, but I'm here to listen." }, { status: 500 });
  }
}
