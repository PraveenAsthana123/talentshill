'use client';

import { useEffect, useState } from 'react';
import styles from './LeadsShared.module.css';

interface DashboardData {
  kpis: {
    totalLeads: number; unscored: number; hot: number; warm: number; cool: number; cold: number;
    newStatus: number; contacted: number; qualified: number; closed: number; totalRuns: number;
  };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/leads/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalLeads}</span>Total leads</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored (score=0)</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Tier breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.hot}</span>Hot</div>
          <div className={styles.vizBox}><span>{data.kpis.warm}</span>Warm</div>
          <div className={styles.vizBox}><span>{data.kpis.cool}</span>Cool</div>
          <div className={styles.vizBox}><span>{data.kpis.cold}</span>Cold</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Status breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.newStatus}</span>New</div>
          <div className={styles.vizBox}><span>{data.kpis.contacted}</span>Contacted</div>
          <div className={styles.vizBox}><span>{data.kpis.qualified}</span>Qualified</div>
          <div className={styles.vizBox}><span>{data.kpis.closed}</span>Closed</div>
        </div>
      </div>
    </div>
  );
}
