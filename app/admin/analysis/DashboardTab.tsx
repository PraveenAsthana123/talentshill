'use client';

import { useEffect, useState } from 'react';
import styles from './AnalysisShared.module.css';

interface DashboardData {
  stats: { totalFrameworks: number; totalAssessments: number; byStatus: { notStarted: number; inProgress: number; completed: number }; avgHealthScore: number; unscoredHealth: number; totalRuns: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analysis/dashboard').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.stats.totalFrameworks}</span>Frameworks</div>
          <div className={styles.vizBox}><span>{data.stats.totalAssessments}</span>Total assessments</div>
          <div className={styles.vizBox}><span>{data.stats.avgHealthScore}</span>Avg health score</div>
          <div className={styles.vizBox}><span>{data.stats.unscoredHealth}</span>Unscored health</div>
          <div className={styles.vizBox}><span>{data.stats.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Status breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.stats.byStatus.notStarted}</span>Not started</div>
          <div className={styles.vizBox}><span>{data.stats.byStatus.inProgress}</span>In progress</div>
          <div className={styles.vizBox}><span>{data.stats.byStatus.completed}</span>Completed</div>
        </div>
      </div>
    </div>
  );
}
