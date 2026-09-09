'use client';

import { useEffect, useState } from 'react';
import styles from './BlogShared.module.css';

interface DashboardData {
  kpis: { totalPosts: number; published: number; drafts: number; archived: number; unscored: number; avgReadiness: number; totalRuns: number; subscribers: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/blog/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalPosts}</span>Total posts</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadiness}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Status breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.published}</span>Published</div>
          <div className={styles.vizBox}><span>{data.kpis.drafts}</span>Drafts</div>
          <div className={styles.vizBox}><span>{data.kpis.archived}</span>Archived</div>
          <div className={styles.vizBox}><span>{data.kpis.subscribers}</span>Subscribers</div>
        </div>
      </div>
    </div>
  );
}
