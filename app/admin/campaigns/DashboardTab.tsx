'use client';

import { useEffect, useState } from 'react';
import styles from './CampaignsShared.module.css';

interface DashboardData {
  kpis: { totalCampaigns: number; draft: number; scheduled: number; sending: number; completed: number; notReadyCount: number; totalSent: number; totalOpened: number; totalRuns: number };
  notReadyCampaigns: { id: string; name: string; status: string }[];
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/campaigns/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalCampaigns}</span>Total</div>
          <div className={styles.vizBox}><span>{data.kpis.notReadyCount}</span>Not launch-ready</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Status breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.draft}</span>Draft</div>
          <div className={styles.vizBox}><span>{data.kpis.scheduled}</span>Scheduled</div>
          <div className={styles.vizBox}><span>{data.kpis.sending}</span>Sending</div>
          <div className={styles.vizBox}><span>{data.kpis.completed}</span>Completed</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Engagement</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalSent}</span>Emails sent</div>
          <div className={styles.vizBox}><span>{data.kpis.totalOpened}</span>Opened</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Campaigns not launch-ready</h4>
        {data.notReadyCampaigns.length === 0 && <p className={styles.empty}>All campaigns are launch-ready.</p>}
        <ul>{data.notReadyCampaigns.map((c) => <li key={c.id}>{c.name} ({c.status})</li>)}</ul>
      </div>
    </div>
  );
}
