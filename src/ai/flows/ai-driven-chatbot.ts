'use server';

/**
 * MindBloom – Intelligent, flexible AI companion
 * Powered by Google Gemini via Genkit
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/* -------------------- SCHEMAS -------------------- */

const ChatInputSchema = z.object({
  message: z.string(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .optional(),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string(),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

/* -------------------- PROMPT (GENKIT-CORRECT) -------------------- */

const prompt = ai.definePrompt({
  name: 'mindbloom_intelligent_prompt_v4',
  input: { schema: ChatInputSchema },
  output: { schema: z.object({ response: z.string() }) },

  // ✅ MUST RETURN AN ARRAY OF PARTS
  prompt: (input: ChatInput) => {
    const { message, history } = input;

    const historyText =
      history && history.length
        ? history.map(h => `${h.role}: ${h.content}`).join('\n')
        : '';

    return [
      {
        text: `
You are MindBloom 🌱 — an intelligent, warm, and adaptable AI companion.

CORE PRINCIPLE:
Respond naturally like a thoughtful human. Do not over-restrict yourself.

INTELLIGENCE RULES:
- Automatically adapt your response style based on the user's message
- Use emotional support ONLY when emotional distress is present
- Give clear advice when the user asks for guidance or says "what should I do"
- Explain concepts clearly when asked
- Use structured steps only when helpful
- Think step by step internally, but do NOT reveal reasoning
- Avoid repetitive comfort phrases

MODE SWITCHING (AUTOMATIC):
- Casual input → brief, friendly reply
- Problems (relationships, college, teachers, life) → thoughtful advice
- Emotional pain → empathy + grounded guidance
- Direct questions → clear, intelligent answers

SAFETY (MINIMAL):
- You are not a medical professional
- Do not diagnose or prescribe medication
- Encourage professional help ONLY when truly necessary

CONVERSATION AWARENESS:
- Use previous messages naturally
- Each reply must add new value

${historyText ? `Conversation so far:\n${historyText}\n` : ''}

User message:
"${message}"

Respond as MindBloom:
        `,
      },
    ];
  },
});

/* -------------------- FLOW -------------------- */

const chatFlow = ai.defineFlow(
  {
    name: 'mindbloom_chat_flow_v4',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);

      return {
        response:
          output?.response ??
          "I’m here with you 🌱 What’s been on your mind?",
      };
    } catch (error) {
      console.error('Chat flow error:', error);

      return {
        response:
          "I’m here with you 🌱 Something didn’t come through clearly, but we can keep talking.",
      };
    }
  }
);

/* -------------------- EXPORT -------------------- */

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
