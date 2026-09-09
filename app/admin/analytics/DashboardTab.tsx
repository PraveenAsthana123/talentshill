'use client';

import { useEffect, useState } from 'react';
import styles from './AnalyticsShared.module.css';

interface HistoryPoint { id: string; healthScore: number; openRateScore: number; clickRateScore: number; bounceRateScore: number; contactHealthScore: number; createdAt: string }
interface DashboardData {
  kpis: { latestHealthScore: number | null; latestSnapshotAt: string | null; totalSnapshots: number; totalRuns: number };
  history: HistoryPoint[];
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Program health</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.latestHealthScore ?? '—'}</span>Latest health score</div>
          <div className={styles.vizBox}><span>{data.kpis.totalSnapshots}</span>Snapshots recorded</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
        {data.kpis.latestSnapshotAt && <p>Last computed {new Date(data.kpis.latestSnapshotAt).toLocaleString()}</p>}
      </div>
      <div className={styles.subSection}>
        <h4>Snapshot history</h4>
        {data.history.length === 0 ? <p className={styles.empty}>No snapshots yet — run Pipeline to compute the first one.</p> : (
          <table className={styles.table}>
            <thead><tr><th>When</th><th>Health</th><th>Open</th><th>Click</th><th>Bounce</th><th>Contacts</th></tr></thead>
            <tbody>{data.history.map((h) => <tr key={h.id}><td>{new Date(h.createdAt).toLocaleString()}</td><td>{h.healthScore}</td><td>{h.openRateScore}</td><td>{h.clickRateScore}</td><td>{h.bounceRateScore}</td><td>{h.contactHealthScore}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
