import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Ensure the API key is being read from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

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
`,
    });

    const chat = model.startChat({
        history: history || [],
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Gemini error:", error);

    // NEVER fail chatbot UX
    return NextResponse.json(
      {
        reply: "I'm here with you. Please try again.",
      },
      { status: 500 }
    );
  }
}
