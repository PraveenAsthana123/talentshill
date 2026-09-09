'use client';

import { useEffect, useState } from 'react';
import styles from './ModuleRegistryShared.module.css';

interface DashboardData {
  kpis: { totalModules: number; cataloged: number; unscored: number; avgDriftScore: number; neverVerified: number; totalRuns: number };
  byBuiltStatus: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/module-registry/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Catalog &amp; drift coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalModules}</span>Total modules</div>
          <div className={styles.vizBox}><span>{data.kpis.cataloged}</span>Cataloged</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgDriftScore}</span>Avg drift score</div>
          <div className={styles.vizBox}><span>{data.kpis.neverVerified}</span>Never verified</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>By built status</h4>
        <p>{Object.entries(data.byBuiltStatus).map(([s, n]) => `${s}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
