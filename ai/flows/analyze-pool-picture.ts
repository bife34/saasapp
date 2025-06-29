// src/ai/flows/analyze-pool-picture.ts
'use server';

/**
 * @fileOverview Analyzes a picture of a pool and provides advice on water clarity and surface condition.
 *
 * - analyzePoolPicture - A function that handles the pool picture analysis process.
 * - AnalyzePoolPictureInput - The input type for the analyzePoolPicture function.
 * - AnalyzePoolPictureOutput - The return type for the analyzePoolPicture function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePoolPictureInputSchema = z.object({
  poolPictureDataUri: z
    .string()
    .describe(
      "A photo of a pool, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePoolPictureInput = z.infer<typeof AnalyzePoolPictureInputSchema>;

const AnalyzePoolPictureOutputSchema = z.object({
  waterClarity: z
    .string()
    .describe('The clarity of the water (e.g., clear, cloudy, murky).'),
  surfaceCondition: z
    .string()
    .describe('The condition of the pool surface (e.g., clean, debris, algae).'),
  recommendedActions: z
    .string()
    .describe('Recommended actions to improve water clarity and surface condition.'),
});
export type AnalyzePoolPictureOutput = z.infer<typeof AnalyzePoolPictureOutputSchema>;

export async function analyzePoolPicture(
  input: AnalyzePoolPictureInput
): Promise<AnalyzePoolPictureOutput> {
  return analyzePoolPictureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePoolPicturePrompt',
  input: {schema: AnalyzePoolPictureInputSchema},
  output: {schema: AnalyzePoolPictureOutputSchema},
  prompt: `You are an expert pool maintenance technician.

You will analyze the provided picture of a pool and provide advice on what actions to take to improve water clarity and surface condition.

Analyze the pool based on the following picture.

Picture: {{media url=poolPictureDataUri}}

Water Clarity: {{waterClarity}}
Surface Condition: {{surfaceCondition}}
Recommended Actions: {{recommendedActions}}`,
});

const analyzePoolPictureFlow = ai.defineFlow(
  {
    name: 'analyzePoolPictureFlow',
    inputSchema: AnalyzePoolPictureInputSchema,
    outputSchema: AnalyzePoolPictureOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
