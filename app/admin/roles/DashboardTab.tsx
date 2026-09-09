'use client';

import { useEffect, useState } from 'react';
import styles from './RolesShared.module.css';

interface DashboardData {
  kpis: { totalRoles: number; system: number; custom: number; withNoPermissions: number; unusedCustom: number; unscored: number; avgHygieneScore: number; totalRuns: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/roles/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalRoles}</span>Total roles</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored hygiene</div>
          <div className={styles.vizBox}><span>{data.kpis.avgHygieneScore}</span>Avg hygiene score</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Type &amp; risk breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.system}</span>System</div>
          <div className={styles.vizBox}><span>{data.kpis.custom}</span>Custom</div>
          <div className={styles.vizBox}><span>{data.kpis.withNoPermissions}</span>No permissions (real risk)</div>
          <div className={styles.vizBox}><span>{data.kpis.unusedCustom}</span>Unused custom (real risk)</div>
        </div>
      </div>
    </div>
  );
}
