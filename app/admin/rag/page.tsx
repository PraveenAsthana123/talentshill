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
import styles from './AdminRag.module.css';

// Module 31 on the Operational Portal 10-tab standard. Manual tab
// wraps the pre-existing dashboard (unchanged logic, links to the
// real Documents/Search/Config/Runs pages), now with real
// operation_run transactional history. Pipeline scores real per-
// document end-to-end readiness, ending in a real retrieval proof.
// Agentic is the module's headline addition: real RAG-powered
// question answering, closing the gap the module registry flagged
// (embeddings were previously random vectors from DummyEmbeddingProvider,
// making vector search non-functional -- see Governance tab).
export default function AdminRagPage() {
  return (
    <div className={styles.page}>
      <SectionHeader label="RAG" title="RAG Dashboard" subtitle="Document ingestion pipeline, search, and configuration, via Manual, Pipeline (deterministic readiness scoring), or Agentic (real local-LLM RAG Q&A) execution modes." />
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
