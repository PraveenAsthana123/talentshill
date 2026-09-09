'use client';

import { Tabs } from '@/components/ui';
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
import styles from './AdminChat.module.css';

// Module 18 on the Operational Portal 10-tab standard. Manual tab wraps
// the pre-existing sessions/requests hub (unchanged logic, links out to
// the existing sessions/[id] and requests/[id] detail pages), now with
// real operation_run transactional history added. Already correctly
// RBAC-gated -- no security remediation needed here.
export default function AdminChatPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chat Management</h1>
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
