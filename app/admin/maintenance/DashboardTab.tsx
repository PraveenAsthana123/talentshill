'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './MaintenanceShared.module.css';

interface HistoryPoint { id: string; score: number; enabled: boolean; enforcementMatchesExpected: boolean; observedStatusCode: number | null; createdAt: string }
interface DashboardData {
  kpis: { currentlyEnabled: boolean; latestCheckScore: number | null; latestCheckAt: string | null; totalChecks: number; totalRuns: number };
  history: HistoryPoint[];
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/maintenance/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Enforcement health</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.currentlyEnabled ? 'ON' : 'OFF'}</span>Currently</div>
          <div className={styles.vizBox}><span>{data.kpis.latestCheckScore ?? '—'}</span>Latest check score</div>
          <div className={styles.vizBox}><span>{data.kpis.totalChecks}</span>Checks recorded</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
        {data.kpis.latestCheckAt && <p>Last checked {new Date(data.kpis.latestCheckAt).toLocaleString()}</p>}
      </div>
      <div className={styles.subSection}>
        <h4>Check history</h4>
        {data.history.length === 0 ? <p className={styles.empty}>No checks yet — run Pipeline to compute the first one.</p> : (
          <table className={styles.table}>
            <thead><tr><th>When</th><th>Score</th><th>Enabled</th><th>Enforcement OK</th><th>Observed Status</th></tr></thead>
            <tbody>{data.history.map((h) => <tr key={h.id}><td>{new Date(h.createdAt).toLocaleString()}</td><td>{h.score}</td><td>{h.enabled ? 'Yes' : 'No'}</td><td><Badge variant={h.enforcementMatchesExpected ? 'success' : 'error'}>{h.enforcementMatchesExpected ? 'OK' : 'MISMATCH'}</Badge></td><td>{h.observedStatusCode ?? '—'}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
