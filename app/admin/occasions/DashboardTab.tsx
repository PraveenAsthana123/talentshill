'use client';

import { useEffect, useState } from 'react';
import styles from './OccasionsShared.module.css';

interface DashboardData {
  kpis: {
    totalMessages: number; logged: number; failed: number;
    totalTemplates: number; activeTemplates: number; totalFestivals: number; activeFestivals: number;
    contactsWithDob: number; contactsWithAnniversary: number; totalRuns: number;
  };
  byOccasionType: Record<string, number>;
  byChannel: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/occasions/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Coverage &amp; volume</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.contactsWithDob}</span>Contacts with DOB on file</div>
          <div className={styles.vizBox}><span>{data.kpis.contactsWithAnniversary}</span>Contacts with anniversary on file</div>
          <div className={styles.vizBox}><span>{data.kpis.activeFestivals}</span>Active festivals ({data.kpis.totalFestivals} total)</div>
          <div className={styles.vizBox}><span>{data.kpis.activeTemplates}</span>Active templates ({data.kpis.totalTemplates} total)</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Messages</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalMessages}</span>Total logged</div>
          <div className={styles.vizBox}><span>{data.kpis.logged}</span>Logged</div>
          <div className={styles.vizBox}><span>{data.kpis.failed}</span>Failed</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Pipeline runs</div>
        </div>
        <p>By occasion type: {Object.entries(data.byOccasionType).map(([t, n]) => `${t}: ${n}`).join(' · ') || 'None yet.'}</p>
        <p>By channel: {Object.entries(data.byChannel).map(([c, n]) => `${c}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
