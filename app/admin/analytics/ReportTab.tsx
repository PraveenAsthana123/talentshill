'use client';

import { useEffect, useState } from 'react';
import styles from './AnalyticsShared.module.css';

interface SnapshotRow { healthScore: number; openRateScore: number; clickRateScore: number; bounceRateScore: number; contactHealthScore: number; createdAt: string }
interface ReportData { generatedAt: string; totalSnapshots: number; snapshots: SnapshotRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Program Health Report (by snapshot)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalSnapshots} snapshots recorded.</p>
      {data.snapshots.length === 0 && <p className={styles.empty}>No snapshots yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>When</th><th>Health</th><th>Open</th><th>Click</th><th>Bounce</th><th>Contacts</th></tr></thead>
        <tbody>
          {data.snapshots.map((s, i) => (
            <tr key={i}><td>{new Date(s.createdAt).toLocaleString()}</td><td>{s.healthScore}</td><td>{s.openRateScore}</td><td>{s.clickRateScore}</td><td>{s.bounceRateScore}</td><td>{s.contactHealthScore}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
