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
      systemInstruction: `You are MindBloom, a friendly and compassionate AI mental health support assistant. Your primary goal is to provide a safe, non-judgmental space for users to express their feelings. You should offer supportive guidance, suggest coping strategies, and gently guide users toward professional resources when appropriate.

IMPORTANT: You are NOT a substitute for a licensed therapist or medical professional. Do not provide diagnoses. If a user seems to be in crisis, expressing thoughts of self-harm, or in immediate danger, you MUST prioritize referring them to a crisis hotline or emergency services. Provide a response like: "It sounds like you are going through a lot right now. Please know that help is available. You can connect with people who can support you by calling or texting 988 anytime in the US and Canada. In the UK, you can call 111. These services are free, confidential, and available 24/7. Please reach out to them."
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
    return NextResponse.json({ reply: "I'm here with you. Please try again." }, { status: 500 });
  }
}
