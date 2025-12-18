'use server';

/**
 * @fileOverview Analyzes user's facial expressions and audio cues to detect stress levels.
 *
 * - analyzeExpression - A function that takes audio and video data URIs as input, analyzes them using GenAI, and returns an assessment of the user's stress level.
 * - AiExpressionAnalysisInput - The input type for the analyzeExpression function.
 * - AiExpressionAnalysisOutput - The return type for the analyzeExpression function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiExpressionAnalysisInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A data URI containing audio data captured from the user's microphone. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  videoDataUri: z
    .string()
    .describe(
      "A data URI containing video data captured from the user's camera, representing facial expressions. It must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AiExpressionAnalysisInput = z.infer<typeof AiExpressionAnalysisInputSchema>;

const AiExpressionAnalysisOutputSchema = z.object({
  stressLevel: z
    .string()
    .describe('The assessed stress level of the user based on facial expressions and audio cues.'),
  explanation: z
    .string()
    .describe('A detailed explanation of the factors contributing to the assessed stress level.'),
});
export type AiExpressionAnalysisOutput = z.infer<typeof AiExpressionAnalysisOutputSchema>;

export async function analyzeExpression(input: AiExpressionAnalysisInput): Promise<AiExpressionAnalysisOutput> {
  return aiExpressionAnalysisFlow(input);
}

const analyzeExpressionPrompt = ai.definePrompt({
  name: 'analyzeExpressionPrompt',
  input: {schema: AiExpressionAnalysisInputSchema},
  output: {schema: AiExpressionAnalysisOutputSchema},
  prompt: `You are an AI-powered mental health assistant that can determine user's current stress level.

You will analyze the user's stress level based on their facial expressions and audio cues.

Based on the facial expression in this video: {{media url=videoDataUri}} and the audio cues in this audio: {{media url=audioDataUri}}, determine the stress level of the user, and provide an explanation for your assessment.

Consider factors such as tone of voice, speech patterns, facial expressions (e.g., furrowed brows, tense jaw), and any other relevant indicators of stress.
`, // Modified prompt to incorporate both audio and video analysis
});

const aiExpressionAnalysisFlow = ai.defineFlow(
  {
    name: 'aiExpressionAnalysisFlow',
    inputSchema: AiExpressionAnalysisInputSchema,
    outputSchema: AiExpressionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await analyzeExpressionPrompt(input);
    return output!;
  }
);
