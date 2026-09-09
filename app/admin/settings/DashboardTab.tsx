'use client';

import { useEffect, useState } from 'react';
import styles from './SettingsShared.module.css';

interface DashboardData {
  kpis: { totalSettings: number; everEdited: number; unscored: number; avgQualityScore: number; totalRuns: number };
  publicWiringNote: string;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Coverage &amp; scoring</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalSettings}</span>Total settings</div>
          <div className={styles.vizBox}><span>{data.kpis.everEdited}</span>Ever edited</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgQualityScore}</span>Avg quality</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Public wiring</h4>
        <p>{data.publicWiringNote}</p>
      </div>
    </div>
  );
}
