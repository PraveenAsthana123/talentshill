'use client';

import { useEffect, useState } from 'react';
import styles from './BrandingShared.module.css';

interface DashboardData {
  kpis: { totalAssets: number; approved: number; unscored: number; avgReadinessScore: number; totalRuns: number; totalMentions: number; scoredMentions: number; latestHealthScore: number | null };
  byCategory: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/branding/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalAssets}</span>Total assets</div>
          <div className={styles.vizBox}><span>{data.kpis.approved}</span>Approved</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Brand perception</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalMentions}</span>Mentions logged</div>
          <div className={styles.vizBox}><span>{data.kpis.scoredMentions}</span>Sentiment-scored</div>
          <div className={styles.vizBox}><span>{data.kpis.latestHealthScore ?? '—'}</span>Latest health score</div>
        </div>
      </div>
      <div className={styles.subSection}><h4>By category</h4><p>{Object.entries(data.byCategory).map(([c, n]) => `${c}: ${n}`).join(' · ') || 'None yet.'}</p></div>
    </div>
  );
}
