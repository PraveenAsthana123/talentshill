'use client';

import { SectionHeader, Tabs } from '@/components/ui';
import ManualTab from './ManualTab';
import PipelineTab from './PipelineTab';
import MonitoringTab from './MonitoringTab';
import DashboardTab from './DashboardTab';
import ReportTab from './ReportTab';
import GovernanceTab from './GovernanceTab';
import UserStoryTab from './UserStoryTab';
import TestingTab from './TestingTab';
import LogTrackingTab from './LogTrackingTab';
import styles from './AdminOccasions.module.css';

// Customer Occasion Messaging, added 2026-09-14. Admin-level only (no
// customer self-service surface, per explicit request) -- admins manage
// the standard template library and festival calendar, and trigger/
// review sends. No Agentic tab: occasion messages are always a real
// template or a real admin-typed custom message, never LLM-composed
// (see Governance for why).
export default function AdminOccasionsPage() {
  return (
    <div className={styles.page}>
      <SectionHeader label="Operations" title="Customer Occasions" subtitle="Birthday, anniversary, festival (including location-based), and custom occasion messages -- admin-managed templates and triggers, deterministic (no AI-generated messages)." />
      <Tabs
        tabs={[
          { id: 'manual', label: 'Manual', content: <ManualTab /> },
          { id: 'pipeline', label: 'Pipeline', content: <PipelineTab /> },
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
