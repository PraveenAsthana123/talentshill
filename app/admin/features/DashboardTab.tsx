'use client';

import { useEffect, useState } from 'react';
import styles from './FeaturesShared.module.css';

interface DashboardData {
  kpis: { totalFlags: number; enabled: number; withoutHistory: number; unscored: number; avgReadinessScore: number; totalRuns: number };
  byModule: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/features/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalFlags}</span>Total flags</div>
          <div className={styles.vizBox}><span>{data.kpis.enabled}</span>Enabled</div>
          <div className={styles.vizBox}><span>{data.kpis.withoutHistory}</span>Without version history</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>By module</h4>
        <p>{Object.entries(data.byModule).map(([m, n]) => `${m}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
