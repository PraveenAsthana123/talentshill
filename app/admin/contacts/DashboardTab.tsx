'use client';

import { useEffect, useState } from 'react';
import styles from './ContactsShared.module.css';

interface DashboardData {
  kpis: { totalContacts: number; unscored: number; active: number; unsubscribed: number; bounced: number; avgScore: number; totalRuns: number };
  bySource: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/contacts/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalContacts}</span>Total contacts</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored (score=0)</div>
          <div className={styles.vizBox}><span>{data.kpis.avgScore}</span>Avg score</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Status breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.active}</span>Active</div>
          <div className={styles.vizBox}><span>{data.kpis.unsubscribed}</span>Unsubscribed</div>
          <div className={styles.vizBox}><span>{data.kpis.bounced}</span>Bounced</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>By source</h4>
        <p>{Object.entries(data.bySource).map(([s, c]) => `${s}: ${c}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
