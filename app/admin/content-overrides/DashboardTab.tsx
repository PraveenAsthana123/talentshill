'use client';

import { useEffect, useState } from 'react';
import styles from './OverridesShared.module.css';

interface DashboardData {
  kpis: { totalOverrides: number; active: number; inactive: number; unscored: number; avgSafetyScore: number; totalRuns: number };
  byPage: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/content-overrides/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalOverrides}</span>Total overrides</div>
          <div className={styles.vizBox}><span>{data.kpis.active}</span>Active</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored safety</div>
          <div className={styles.vizBox}><span>{data.kpis.avgSafetyScore}</span>Avg safety score</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>By page</h4>
        <p>{Object.entries(data.byPage).map(([p, n]) => `${p}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
