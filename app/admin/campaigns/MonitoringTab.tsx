'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import OperationHealthCheck from '@/components/admin/OperationHealthCheck';
import styles from './CampaignsShared.module.css';

interface RunEntry { id: string; operationName: string; executionMode: string; status: string; tokensUsed: number | null; createdAt: string }
interface AgentStep { id: string; phase: string; agentRole: string; tokensUsed: number | null; createdAt: string }
interface JobEntry { id: string; status: string; attempts: number; createdAt: string }
interface MonitoringData {
  runs: RunEntry[]; agentSteps: AgentStep[];
  summary: { totalRuns: number; byMode: Record<string, number>; totalTokensUsed: number; runningNow: number };
  vectorDb: { note: string }; jobQueue: { note: string; jobs: JobEntry[] };
}

export default function MonitoringTab() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/campaigns/monitoring/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <OperationHealthCheck moduleKey="campaigns" />
      <div className={styles.subSection}>
        <h4>Live status</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.summary.totalRuns}</span>Total runs</div>
          <div className={styles.vizBox}><span>{data.summary.runningNow}</span>Running now</div>
          <div className={styles.vizBox}><span>{data.summary.totalTokensUsed}</span>Total tokens</div>
        </div>
      </div>
      <div className={styles.subSection}><h4>Runs by mode</h4><p>{Object.entries(data.summary.byMode).map(([m, c]) => `${m}: ${c}`).join(' · ') || 'None yet.'}</p></div>
      <div className={styles.subSection}>
        <h4>Job queue (real usage — campaign_send jobs)</h4>
        <p className={styles.empty}>{data.jobQueue.note}</p>
        {data.jobQueue.jobs.length > 0 && (
          <table className={styles.table}>
            <thead><tr><th>When</th><th>Status</th><th>Attempts</th></tr></thead>
            <tbody>{data.jobQueue.jobs.map((j) => <tr key={j.id}><td>{new Date(j.createdAt).toLocaleString()}</td><td><Badge variant={j.status === 'completed' ? 'success' : j.status === 'failed' ? 'error' : 'warning'}>{j.status}</Badge></td><td>{j.attempts}</td></tr>)}</tbody>
          </table>
        )}
      </div>
      <div className={styles.subSection}><h4>Vector DB</h4><p className={styles.empty}>{data.vectorDb.note}</p></div>
      <div className={styles.subSection}>
        <h4>Recent agent activity</h4>
        {data.agentSteps.length === 0 && <p className={styles.empty}>No agent steps yet.</p>}
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Phase</th><th>Role</th><th>Tokens</th></tr></thead>
          <tbody>{data.agentSteps.map((s) => <tr key={s.id}><td>{new Date(s.createdAt).toLocaleString()}</td><td>{s.phase}</td><td>{s.agentRole}</td><td>{s.tokensUsed ?? '—'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
