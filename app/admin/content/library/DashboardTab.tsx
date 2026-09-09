'use client';

import { useEffect, useState } from 'react';
import styles from './ContentShared.module.css';

interface DashboardData {
  kpis: { totalContent: number; published: number; draft: number; unscored: number; avgReadinessScore: number; totalRuns: number };
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/content/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalContent}</span>Total content</div>
          <div className={styles.vizBox}><span>{data.kpis.published}</span>Published</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
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
