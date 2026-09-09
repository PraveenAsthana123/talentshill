'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './RunsShared.module.css';

interface RunRow { name: string; type: string; status: string; healthScore: number | null; createdAt: string }
interface ReportData { generatedAt: string; totalRuns: number; runs: RunRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/runs/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Run Report (by health score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalRuns} total runs.</p>
      {data.runs.length === 0 && <p className={styles.empty}>No runs yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Health Score</th><th>Created</th></tr></thead>
        <tbody>
          {data.runs.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.type}</td>
              <td><Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'error' : 'default'}>{r.status}</Badge></td>
              <td>{r.healthScore ?? '—'}</td>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
