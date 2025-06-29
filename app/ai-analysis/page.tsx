import {
  handlePoolPictureAnalysis,
  handleTestStripAnalysis,
} from '@/app/actions';
import { AIAnalysisCard } from '@/components/ai-analysis-card';

export default function AIAnalysisPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <AIAnalysisCard
        title="Test Strip Analysis"
        description="Upload a photo of a test strip to get instant chemical readings and recommendations."
        action={handleTestStripAnalysis}
        inputKey="testStripDataUri"
      />
      <AIAnalysisCard
        title="Pool Picture Analysis"
        description="Upload a photo of your pool to get AI-driven advice on water clarity and surface condition."
        action={handlePoolPictureAnalysis}
        inputKey="poolPictureDataUri"
      />
    </div>
  );
}
