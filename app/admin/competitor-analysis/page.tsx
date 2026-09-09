'use client';

import { SectionHeader, Tabs } from '@/components/ui';
import ManualTab from './ManualTab';
import PipelineTab from './PipelineTab';
import AgenticTab from './AgenticTab';
import MonitoringTab from './MonitoringTab';
import DashboardTab from './DashboardTab';
import ReportTab from './ReportTab';
import UserStoryTab from './UserStoryTab';
import TestingTab from './TestingTab';
import LogTrackingTab from './LogTrackingTab';
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
          { id: 'agentic', label: 'Agentic', content: <AgenticTab /> },
          { id: 'monitoring', label: 'Monitoring', content: <MonitoringTab /> },
          { id: 'dashboard', label: 'Dashboard', content: <DashboardTab /> },
          { id: 'report', label: 'Report', content: <ReportTab /> },
          { id: 'governance', label: 'Governance', content: <NotYetBuiltTab tabName="Governance" /> },
          { id: 'user-story', label: 'User Story', content: <UserStoryTab /> },
          { id: 'testing', label: 'Testing', content: <TestingTab /> },
          { id: 'log-tracking', label: 'Log & Tracking', content: <LogTrackingTab /> },
        ]}
      />
    </div>
  );
}
