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
import styles from './AdminRuns.module.css';

// Module 32 on the Operational Portal 10-tab standard. Manual tab
// wraps the pre-existing Run Console (filter table + timeline), now
// with a real Force Status control (previously an orphaned PATCH
// endpoint) and real transactional history. Pipeline scores real
// per-run health; Agentic reuses it as the "search" step for a
// local-LLM advisory recommendation. The headline fix (see Governance)
// is in lib/jobs/handlers/broadcast-sender.ts, not this UI -- the
// runs/run_events tables had zero real callers anywhere in the app
// before this build.
export default function AdminRunsPage() {
  return (
    <div className={styles.page}>
      <SectionHeader label="Operations" title="Run Console" subtitle="View all system operations and their event timelines, via Manual, Pipeline (deterministic health scoring), or Agentic (local LLM) execution modes." />
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
