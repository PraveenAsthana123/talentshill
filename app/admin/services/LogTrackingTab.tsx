'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './ServicesShared.module.css';

interface RunEntry { id: string; operationName: string; executionMode: string; status: string; errorMessage: string | null; triggeredBy: string | null; startedAt: string | null; completedAt: string | null; createdAt: string }

export default function LogTrackingTab() {
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/operation-runs/?moduleKey=services&limit=200').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then((d) => setRuns(d.runs || [])).catch((e) => setError(String(e)));
  }, []);

  return (
    <div className={styles.subSection}>
      <h4>Operation log &amp; audit trail</h4>
      {error && <p className={styles.error}>{error}</p>}
      {!error && runs.length === 0 && <p className={styles.empty}>No operations logged yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>When</th><th>Mode</th><th>Operation</th><th>Status</th><th>Duration</th><th>By</th><th>Error</th></tr></thead>
        <tbody>
          {runs.map((r) => {
            const duration = r.startedAt && r.completedAt ? `${((new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime()) / 1000).toFixed(1)}s` : '—';
            return (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td><Badge variant="default">{r.executionMode}</Badge></td>
                <td>{r.operationName}</td>
                <td><Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'error' : 'warning'}>{r.status}</Badge></td>
                <td>{duration}</td>
                <td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td>
                <td>{r.errorMessage || '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
