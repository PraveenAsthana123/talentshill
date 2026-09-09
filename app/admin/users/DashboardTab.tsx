'use client';

import { useEffect, useState } from 'react';
import styles from './UsersShared.module.css';

interface DashboardData {
  kpis: { totalUsers: number; active: number; inactive: number; withNoRoles: number; unscored: number; avgSecurityScore: number; totalRuns: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalUsers}</span>Total users</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored security</div>
          <div className={styles.vizBox}><span>{data.kpis.avgSecurityScore}</span>Avg security score</div>
          <div className={styles.vizBox}><span>{data.kpis.withNoRoles}</span>With no roles (real risk)</div>
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
    </div>
  );
}
