'use client';

import { useEffect, useState } from 'react';
import styles from './ProfilesShared.module.css';

interface DashboardData {
  kpis: { totalProfiles: number; active: number; withoutSmtp: number; unscored: number; avgReadinessScore: number; totalRuns: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/email-profiles/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalProfiles}</span>Total profiles</div>
          <div className={styles.vizBox}><span>{data.kpis.active}</span>Active</div>
          <div className={styles.vizBox}><span>{data.kpis.withoutSmtp}</span>Without SMTP linked</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
    </div>
  );
}
