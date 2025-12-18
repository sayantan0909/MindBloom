// Mental Health Support System JavaScript

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
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot response to the user message.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mentalHealthChatPrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are a mental health support chatbot designed to provide coping suggestions and, if necessary, refer users to professional help.

  Respond to the user message: "{{message}}".

  If the user expresses feelings of anxiety, suggest deep breathing exercises, grounding techniques, and exploring available resources or counselor booking.

  If the user expresses feelings of depression or sadness, acknowledge their feelings and suggest maintaining a routine, getting regular exercise, connecting with others, and considering a depression screening or speaking with a counselor.

  If the user indicates a crisis or emergency, provide immediate contact information for helplines and emergency services.

  If the user asks for coping strategies, suggest mindfulness, meditation, regular exercise, healthy sleep routine, journaling, connecting with supportive people, and professional counseling.

  If the user mentions stress, recommend time management, regular breaks, physical activity, relaxation techniques, and adequate sleep.

  Encourage users to seek support and remind them that it's a sign of strength.
  `,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
