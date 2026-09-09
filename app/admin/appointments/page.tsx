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
import styles from './AdminAppointments.module.css';

// Module 5 on the Operational Portal 10-tab standard. Manual tab wraps
// the pre-existing, already-working booking dashboard (unchanged logic),
// now with real operation_run transactional history added. Built
// alongside a real security fix: see Governance tab (GovAI/Risk AI) for
// the 2026-09-09 unauthenticated-access finding and remediation.
export default function AdminAppointmentsPage() {
  return (
    <div className={styles.page}>
      <div className="container section">
        <SectionHeader label="Admin" title="Appointment Dashboard" subtitle="Manage bookings, track leads, and monitor conversion via Manual, Pipeline (deterministic), or Agentic (local LLM) execution modes." />
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
    </div>
  );
}
