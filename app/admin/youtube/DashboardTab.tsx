'use client';

import { useEffect, useState } from 'react';
import styles from './YoutubeShared.module.css';

interface DashboardData {
  kpis: {
    totalVideos: number; published: number; syncedToRealChannel: number; unscored: number; avgReadinessScore: number; totalRuns: number;
    totalSnapshots: number; latestSubscriberCount: number | null; latestTotalViews: number | null; latestSnapshotDate: string | null;
  };
  byStatus: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/youtube/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalVideos}</span>Total videos</div>
          <div className={styles.vizBox}><span>{data.kpis.published}</span>Published</div>
          <div className={styles.vizBox}><span>{data.kpis.syncedToRealChannel}</span>With real video ID</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Channel Growth Engine</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalSnapshots}</span>Channel snapshots</div>
          <div className={styles.vizBox}><span>{data.kpis.latestSubscriberCount ?? '—'}</span>Latest subscribers</div>
          <div className={styles.vizBox}><span>{data.kpis.latestTotalViews ?? '—'}</span>Latest total views</div>
        </div>
        {data.kpis.latestSnapshotDate && <p>Latest snapshot: {new Date(data.kpis.latestSnapshotDate).toLocaleDateString()}</p>}
      </div>
      <div className={styles.subSection}><h4>By status</h4><p>{Object.entries(data.byStatus).map(([s, n]) => `${s}: ${n}`).join(' · ') || 'None yet.'}</p></div>
    </div>
  );
}
