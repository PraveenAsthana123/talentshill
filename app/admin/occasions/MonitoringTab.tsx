'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import OperationHealthCheck from '@/components/admin/OperationHealthCheck';
import styles from './OccasionsShared.module.css';

interface RunEntry { id: string; operationName: string; executionMode: string; status: string; tokensUsed: number | null; createdAt: string }
interface MonitoringData {
  runs: RunEntry[];
  summary: { totalRuns: number; byMode: Record<string, number>; totalTokensUsed: number; runningNow: number };
  vectorDb: { note: string }; jobQueue: { note: string };
}

export default function MonitoringTab() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/occasions/monitoring/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <OperationHealthCheck moduleKey="occasions" />
      <div className={styles.subSection}>
        <h4>Live status</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.summary.totalRuns}</span>Total runs</div>
          <div className={styles.vizBox}><span>{data.summary.runningNow}</span>Running now</div>
          <div className={styles.vizBox}><span>{data.summary.totalTokensUsed}</span>Total tokens</div>
        </div>
      </div>
      <div className={styles.subSection}><h4>Runs by mode</h4><p>{Object.entries(data.summary.byMode).map(([m, c]) => `${m}: ${c}`).join(' · ') || 'None yet.'}</p></div>
      <div className={styles.subSection}><h4>Job queue</h4><p className={styles.empty}>{data.jobQueue.note}</p></div>
      <div className={styles.subSection}><h4>Vector DB</h4><p className={styles.empty}>{data.vectorDb.note}</p></div>
      <div className={styles.subSection}>
        <h4>Recent runs, all modes</h4>
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Mode</th><th>Status</th><th>Tokens</th></tr></thead>
          <tbody>{data.runs.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td><Badge variant="default">{r.executionMode}</Badge></td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.tokensUsed ?? '—'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
