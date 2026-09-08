import type { Metadata } from 'next';
import { SurveyWizard } from '@/features/survey';
import { SectionHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'AI Readiness Assessment',
  description: 'Assess your organization AI readiness across GenAI, Robotics, and Quantum computing.',
};

export default function SurveyPage() {
  return (
    <div style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="container section">
        <SectionHeader
          label="Assessment"
          title="AI Readiness Survey"
          subtitle="Answer 8 questions to get your personalized AI readiness score and recommendations."
        />
        <SurveyWizard />
      </div>
    </div>
  );
}
