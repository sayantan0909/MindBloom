'use server';

/**
 * @fileOverview AI-Driven Chatbot for mental health support, providing coping strategies and professional referrals.
 *
 * This file exports:
 * - `chat` - A function that interacts with the chatbot and returns its response.
 * - `ChatInput` - The input type for the chat function.
 * - `ChatOutput` - The output type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message to the chatbot.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The conversation history.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.').optional(),
  error: z.string().describe('An error message if the chatbot failed to respond.').optional(),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
    return await chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentalHealthChatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: z.object({ response: z.string() })},
  prompt: `You are MindBloom 🌱, a gentle, calm, emotionally supportive companion.

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

Conversation History:
{{#if history}}
{{#each history}}
{{#if (eq role 'user')}}User: {{content}}{{/if}}
{{#if (eq role 'model')}}MindBloom: {{content}}{{/if}}
{{/each}}
{{/if}}

User's latest message: "{{message}}"
`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    try {
        const {output} = await prompt(input);
        if (!output) {
          return { error: 'Failed to get a response from the AI.' };
        }
        return { response: output.response };
    } catch (e: any) {
        console.error('Chat flow failed:', e);
        if (e.message?.includes('503 Service Unavailable') || e.message?.includes('model is overloaded')) {
          return { error: 'The AI assistant is currently experiencing high demand. Please try again in a moment.' };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
  }
);
