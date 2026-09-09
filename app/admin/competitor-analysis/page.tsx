'use client';

import { SectionHeader, Tabs } from '@/components/ui';
import ManualTab from './ManualTab';
import PipelineTab from './PipelineTab';
import NotYetBuiltTab from './NotYetBuiltTab';
import styles from './AdminCompetitorAnalysis.module.css';

// Pilot module for the Operational Portal Page & Tab Standard's 10-tab
// requirement. Manual is real and fully built; the other 9 are honestly
// marked not-yet-built rather than filled with placeholder content.
export default function CompetitorAnalysisPage() {
  return (
    <div className={styles.page}>
      <SectionHeader
        title="Competitor Analysis"
        subtitle="Admin-only market-research intelligence — never shown to customers. Pilot module for the Operational Portal 10-tab standard."
      />
      <Tabs
        tabs={[
          { id: 'manual', label: 'Manual', content: <ManualTab /> },
          { id: 'pipeline', label: 'Pipeline', content: <PipelineTab /> },
          { id: 'agentic', label: 'Agentic', content: <NotYetBuiltTab tabName="Agentic" /> },
          { id: 'monitoring', label: 'Monitoring', content: <NotYetBuiltTab tabName="Monitoring" /> },
          { id: 'dashboard', label: 'Dashboard', content: <NotYetBuiltTab tabName="Dashboard" /> },
          { id: 'report', label: 'Report', content: <NotYetBuiltTab tabName="Report" /> },
          { id: 'governance', label: 'Governance', content: <NotYetBuiltTab tabName="Governance" /> },
          { id: 'user-story', label: 'User Story', content: <NotYetBuiltTab tabName="User Story" /> },
          { id: 'testing', label: 'Testing', content: <NotYetBuiltTab tabName="Testing" /> },
          { id: 'log-tracking', label: 'Log & Tracking', content: <NotYetBuiltTab tabName="Log & Tracking" /> },
        ]}
      />
    </div>
  );
}
