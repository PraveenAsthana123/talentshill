'use client';

import { useEffect, useState } from 'react';
import styles from './VideosShared.module.css';

interface DashboardData {
  kpis: { totalVideos: number; active: number; inactive: number; unscored: number; avgContentScore: number; totalRuns: number };
  byProvider: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/videos/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalVideos}</span>Total videos</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored content</div>
          <div className={styles.vizBox}><span>{data.kpis.avgContentScore}</span>Avg content score</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Status breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.active}</span>Active</div>
          <div className={styles.vizBox}><span>{data.kpis.inactive}</span>Inactive</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>By provider</h4>
        <p>{Object.entries(data.byProvider).map(([p, n]) => `${p}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
