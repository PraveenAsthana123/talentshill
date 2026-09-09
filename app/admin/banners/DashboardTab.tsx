'use client';

import { useEffect, useState } from 'react';
import styles from './BannersShared.module.css';

interface DashboardData {
  kpis: { totalBanners: number; active: number; inactive: number; unscored: number; avgHealth: number; staleActive: number; totalRuns: number };
  byPlacement: { top: number; bottom: number; modal: number; inline: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/banners/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; health coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalBanners}</span>Total banners</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored health</div>
          <div className={styles.vizBox}><span>{data.kpis.avgHealth}</span>Avg health</div>
          <div className={styles.vizBox}><span>{data.kpis.staleActive}</span>Stale-active (real bugs)</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Status &amp; placement breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.active}</span>Active</div>
          <div className={styles.vizBox}><span>{data.kpis.inactive}</span>Inactive</div>
          <div className={styles.vizBox}><span>{data.byPlacement.top}</span>Top</div>
          <div className={styles.vizBox}><span>{data.byPlacement.bottom}</span>Bottom</div>
          <div className={styles.vizBox}><span>{data.byPlacement.modal}</span>Modal</div>
          <div className={styles.vizBox}><span>{data.byPlacement.inline}</span>Inline</div>
        </div>
      </div>
    </div>
  );
}
