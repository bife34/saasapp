
'use server';

import {
  analyzePoolPicture,
  AnalyzePoolPictureInput,
  AnalyzePoolPictureOutput,
} from '@/ai/flows/analyze-pool-picture';
import {
  analyzeTestStrip,
  AnalyzeTestStripInput,
  AnalyzeTestStripOutput,
} from '@/ai/flows/analyze-test-strip';

export {
  type AnalyzePoolPictureInput,
  type AnalyzePoolPictureOutput,
  type AnalyzeTestStripInput,
  type AnalyzeTestStripOutput,
};

export async function handleTestStripAnalysis(
  input: AnalyzeTestStripInput
): Promise<AnalyzeTestStripOutput> {
  // In a real app, you'd add validation, error handling, and user authentication checks here.
  return analyzeTestStrip(input);
}

export async function handlePoolPictureAnalysis(
  input: AnalyzePoolPictureInput
): Promise<AnalyzePoolPictureOutput> {
  // In a real app, you'd add validation, error handling, and user authentication checks here.
  return analyzePoolPicture(input);
}
