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
import styles from './AdminContentLibrary.module.css';

// Module 19 on the Operational Portal 10-tab standard. This is the
// nav-linked home page for the 'content' RBAC resource (which also
// covers the brochures/presentations/links/editor sub-pages, left
// untouched as specialized builders, same pattern as templates/[id]).
// Manual tab wraps the pre-existing library grid/search/filters
// (unchanged logic), now with real operation_run transactional history
// added. Already correctly RBAC-gated -- no security remediation
// needed here.
export default function AdminContentLibraryPage() {
  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Content Library" subtitle="Create and manage marketing content across all channels, via Manual, Pipeline (deterministic readiness scoring), or Agentic (local LLM) execution modes." />
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
