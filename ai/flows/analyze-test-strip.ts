'use server';

/**
 * @fileOverview AI flow for analyzing pool test strip images and providing chemical level suggestions.
 *
 * - analyzeTestStrip - Analyzes a test strip image and suggests pool chemical adjustments.
 * - AnalyzeTestStripInput - Input type for the analyzeTestStrip function, including the image data URI.
 * - AnalyzeTestStripOutput - Return type for the analyzeTestStrip function, providing chemical level analysis and suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Test Strip Analysis Flow
const AnalyzeTestStripInputSchema = z.object({
  testStripDataUri: z
    .string()
    .describe(
      'A photo of a pool test strip, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type AnalyzeTestStripInput = z.infer<typeof AnalyzeTestStripInputSchema>;

const AnalyzeTestStripOutputSchema = z.object({
  chemicalLevels: z.object({
    chlorine: z.string().describe('The chlorine level reading from the test strip.'),
    ph: z.string().describe('The pH level reading from the test strip.'),
    alkalinity: z.string().describe('The alkalinity level reading from the test strip.'),
    cyanuricAcid: z.string().describe('The cyanuric acid level reading from the test strip.'),
  }).describe('The chemical levels read from the test strip.'),
  suggestions: z.string().describe('AI-driven suggestions for adjusting chemical levels in the pool.'),
});
export type AnalyzeTestStripOutput = z.infer<typeof AnalyzeTestStripOutputSchema>;

export async function analyzeTestStrip(input: AnalyzeTestStripInput): Promise<AnalyzeTestStripOutput> {
  return analyzeTestStripFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTestStripPrompt',
  input: {schema: AnalyzeTestStripInputSchema},
  output: {schema: AnalyzeTestStripOutputSchema},
  prompt: `You are an expert pool maintenance advisor. Analyze the provided image of a pool test strip and provide chemical level readings and specific suggestions for adjusting the pool's chemical balance.

Analyze the chemical levels in the test strip from the following image:
{{media url=testStripDataUri}}

Provide your analysis and suggestions in the following format:

Chemical Levels:
{chlorine: <chlorine_level>, ph: <ph_level>, alkalinity: <alkalinity_level>, cyanuricAcid: <cyanuric_acid_level>}

Suggestions: <suggestions_for_adjusting_chemical_levels>`,
});

const analyzeTestStripFlow = ai.defineFlow(
  {
    name: 'analyzeTestStripFlow',
    inputSchema: AnalyzeTestStripInputSchema,
    outputSchema: AnalyzeTestStripOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
