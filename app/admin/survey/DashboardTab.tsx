'use client';

import { useEffect, useState } from 'react';
import styles from './SurveyShared.module.css';

interface DashboardData {
  kpis: { totalResponses: number; unscored: number; avgOutreachPriority: number; hasEmail: number; totalRuns: number };
  byMaturity: { beginner: number; developing: number; advanced: number; leader: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/survey/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalResponses}</span>Total responses</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored priority</div>
          <div className={styles.vizBox}><span>{data.kpis.avgOutreachPriority}</span>Avg priority</div>
          <div className={styles.vizBox}><span>{data.kpis.hasEmail}</span>Have email</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Maturity breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.byMaturity.beginner}</span>Beginner</div>
          <div className={styles.vizBox}><span>{data.byMaturity.developing}</span>Developing</div>
          <div className={styles.vizBox}><span>{data.byMaturity.advanced}</span>Advanced</div>
          <div className={styles.vizBox}><span>{data.byMaturity.leader}</span>Leader</div>
        </div>
      </div>
    </div>
  );
}
