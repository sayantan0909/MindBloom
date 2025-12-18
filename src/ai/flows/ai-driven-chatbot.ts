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
  prompt: `You are MindBloom, a friendly and compassionate AI mental health support assistant. Your primary goal is to provide a safe, non-judgmental space for users to express their feelings. You should offer supportive guidance, suggest coping strategies, and gently guide users toward professional resources when appropriate.

IMPORTANT: You are NOT a substitute for a licensed therapist or medical professional. Do not provide diagnoses. If a user seems to be in crisis, expressing thoughts of self-harm, or in immediate danger, you MUST prioritize referring them to a crisis hotline or emergency services.

Conversation History:
{{#if history}}
{{#each history}}
{{#if (eq role 'user')}}User: {{content}}{{/if}}
{{#if (eq role 'model')}}MindBloom: {{content}}{{/if}}
{{/each}}
{{/if}}

User's latest message: "{{message}}"

Based on the conversation, provide a response that is:
1. Empathetic and validating.
2. Offers relevant, actionable coping strategies (e.g., mindfulness, breathing exercises, journaling).
3. If applicable, suggest relevant features of the app (e.g., "You might find the 'Breathing Exercise' in our Resources section helpful.").
4. If the user's message indicates a crisis (mentions of suicide, self-harm, hopelessness), immediately provide a response like: "It sounds like you are going through a lot right now. Please know that help is available. You can connect with people who can support you by calling or texting 988 anytime in the US and Canada. In the UK, you can call 111. These services are free, confidential, and available 24/7. Please reach out to them."
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
        return output;
    } catch (e: any) {
        console.error('Chat flow failed:', e);
        if (e.message?.includes('503 Service Unavailable') || e.message?.includes('model is overloaded')) {
          return { error: 'The AI assistant is currently experiencing high demand. Please try again in a moment.' };
        }
        return { error: 'An unexpected error occurred. Please try again.' };
    }
  }
);
