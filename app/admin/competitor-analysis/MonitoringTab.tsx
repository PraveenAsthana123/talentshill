'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import OperationHealthCheck from '@/components/admin/OperationHealthCheck';
import styles from './AdminCompetitorAnalysis.module.css';

interface RunEntry {
  id: string;
  operationName: string;
  executionMode: string;
  status: string;
  tokensUsed: number | null;
  createdAt: string;
}

interface AgentStep {
  id: string;
  runId: string;
  phase: string;
  agentRole: string;
  tokensUsed: number | null;
  createdAt: string;
}

interface MonitoringData {
  runs: RunEntry[];
  agentSteps: AgentStep[];
  summary: {
    totalRuns: number;
    byMode: Record<string, number>;
    byStatus: Record<string, number>;
    totalTokensUsed: number;
    runningNow: number;
  };
  vectorDb: { applicable: boolean; note: string };
  jobQueue: { applicable: boolean; note: string };
}

export default function MonitoringTab() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/competitor-analysis/monitoring/')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <OperationHealthCheck moduleKey="competitor_analysis" />
      <div className={styles.subSection}>
        <h4>Live status</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.summary.totalRuns}</span>Total runs (all modes)</div>
          <div className={styles.vizBox}><span>{data.summary.runningNow}</span>Running now</div>
          <div className={styles.vizBox}><span>{data.summary.totalTokensUsed}</span>Total tokens used</div>
        </div>
      </div>

      <div className={styles.subSection}>
        <h4>Runs by execution mode</h4>
        <p>{Object.entries(data.summary.byMode).map(([mode, count]) => `${mode}: ${count}`).join(' · ') || 'No runs yet.'}</p>
      </div>

      <div className={styles.subSection}>
        <h4>Runs by status</h4>
        <p>{Object.entries(data.summary.byStatus).map(([status, count]) => `${status}: ${count}`).join(' · ') || 'No runs yet.'}</p>
      </div>

      <div className={styles.subSection}>
        <h4>Job queue</h4>
        <p className={styles.empty}>{data.jobQueue.note}</p>
      </div>

      <div className={styles.subSection}>
        <h4>Vector DB state</h4>
        <p className={styles.empty}>{data.vectorDb.note}</p>
      </div>

      <div className={styles.subSection}>
        <h4>Recent agent activity (real, from agentic runs)</h4>
        {data.agentSteps.length === 0 && <p className={styles.empty}>No agent steps logged yet.</p>}
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Phase</th><th>Agent role</th><th>Tokens</th></tr></thead>
          <tbody>
            {data.agentSteps.map((s) => (
              <tr key={s.id}>
                <td>{new Date(s.createdAt).toLocaleString()}</td>
                <td>{s.phase}</td>
                <td>{s.agentRole}</td>
                <td>{s.tokensUsed ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.subSection}>
        <h4>Recent runs, all modes (status &amp; update history)</h4>
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Mode</th><th>Operation</th><th>Status</th><th>Tokens</th></tr></thead>
          <tbody>
            {data.runs.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td><Badge variant="default">{r.executionMode}</Badge></td>
                <td>{r.operationName}</td>
                <td><Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'error' : 'warning'}>{r.status}</Badge></td>
                <td>{r.tokensUsed ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
