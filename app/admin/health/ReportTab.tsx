'use client';

import { useEffect, useState } from 'react';
import styles from './HealthShared.module.css';

interface SnapshotRow { healthScore: number; jobRunnerScore: number; recentErrorsScore: number; jobFailureRateScore: number; dbSizeScore: number; createdAt: string }
interface ReportData { generatedAt: string; totalSnapshots: number; snapshots: SnapshotRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/health/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>System Health Report (by snapshot)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalSnapshots} snapshots recorded.</p>
      {data.snapshots.length === 0 && <p className={styles.empty}>No snapshots yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>When</th><th>Health</th><th>Job Runner</th><th>Errors</th><th>Failure Rate</th><th>DB Size</th></tr></thead>
        <tbody>
          {data.snapshots.map((s, i) => (
            <tr key={i}><td>{new Date(s.createdAt).toLocaleString()}</td><td>{s.healthScore}</td><td>{s.jobRunnerScore}</td><td>{s.recentErrorsScore}</td><td>{s.jobFailureRateScore}</td><td>{s.dbSizeScore}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
