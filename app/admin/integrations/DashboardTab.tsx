'use client';

import { useEffect, useState } from 'react';
import styles from './IntegrationsShared.module.css';

interface DashboardData {
  kpis: { totalIntegrations: number; totalAccounts: number; connected: number; withErrors: number; unscored: number; avgReadinessScore: number; totalRuns: number };
  byCategory: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/integrations/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalIntegrations}</span>Total providers</div>
          <div className={styles.vizBox}><span>{data.kpis.totalAccounts}</span>Total accounts</div>
          <div className={styles.vizBox}><span>{data.kpis.connected}</span>Connected</div>
          <div className={styles.vizBox}><span>{data.kpis.withErrors}</span>With errors</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>By category</h4>
        <p>{Object.entries(data.byCategory).map(([c, n]) => `${c}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
