'use client';

import { SectionHeader, Tabs } from '@/components/ui';
import ManualTab from './ManualTab';
import PipelineTab from './PipelineTab';
import AgenticTab from './AgenticTab';
import MonitoringTab from './MonitoringTab';
import DashboardTab from './DashboardTab';
import ReportTab from './ReportTab';
import GovernanceTab from './GovernanceTab';
import UserStoryTab from './UserStoryTab';
import TestingTab from './TestingTab';
import LogTrackingTab from './LogTrackingTab';
import styles from './AdminCompose.module.css';

// Module 21 on the Operational Portal 10-tab standard. Manual tab
// wraps the pre-existing one-off send form (unchanged UI/logic), now
// with a real fixed bug: the selected sender profile was silently
// dropped server-side and is now honored. No persisted draft entity
// exists, so Pipeline/Agentic write to a new real email_compose_log
// audit table instead of updating a record in place.
export default function AdminComposePage() {
  return (
    <div className={styles.page}>
      <SectionHeader label="Operations" title="Compose Email" subtitle="Send a one-off email to any recipient, via Manual, Pipeline (deterministic readiness scoring), or Agentic (local LLM) execution modes." />
      <Tabs
        tabs={[
          { id: 'manual', label: 'Manual', content: <ManualTab /> },
          { id: 'pipeline', label: 'Pipeline', content: <PipelineTab /> },
          { id: 'agentic', label: 'Agentic', content: <AgenticTab /> },
          { id: 'monitoring', label: 'Monitoring', content: <MonitoringTab /> },
          { id: 'dashboard', label: 'Dashboard', content: <DashboardTab /> },
          { id: 'report', label: 'Report', content: <ReportTab /> },
          { id: 'governance', label: 'Governance', content: <GovernanceTab /> },
          { id: 'user-story', label: 'User Story', content: <UserStoryTab /> },
          { id: 'testing', label: 'Testing', content: <TestingTab /> },
          { id: 'log-tracking', label: 'Log & Tracking', content: <LogTrackingTab /> },
        ]}
      />
    </div>
  );
}
