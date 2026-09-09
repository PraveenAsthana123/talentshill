'use client';

import { useEffect, useState } from 'react';
import styles from './RunsShared.module.css';

interface DashboardData {
  kpis: { totalRuns: number; active: number; failed: number; unscored: number; avgHealthScore: number; totalOperationRuns: number };
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/runs/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total runs</div>
          <div className={styles.vizBox}><span>{data.kpis.active}</span>Active</div>
          <div className={styles.vizBox}><span>{data.kpis.failed}</span>Failed</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgHealthScore}</span>Avg health</div>
          <div className={styles.vizBox}><span>{data.kpis.totalOperationRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>By type</h4>
        <p>{Object.entries(data.byType).map(([t, n]) => `${t}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
      <div className={styles.subSection}>
        <h4>By status</h4>
        <p>{Object.entries(data.byStatus).map(([s, n]) => `${s}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
