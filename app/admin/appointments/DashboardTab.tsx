'use client';

import { useEffect, useState } from 'react';
import styles from './AppointmentsShared.module.css';

interface DashboardData {
  kpis: { totalAppointments: number; unscored: number; pending: number; confirmed: number; completed: number; cancelled: number; avgUrgency: number; totalRuns: number };
  byTier: { hot: number; warm: number; cool: number; cold: number };
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/appointments/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalAppointments}</span>Total bookings</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored urgency</div>
          <div className={styles.vizBox}><span>{data.kpis.avgUrgency}</span>Avg urgency</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Status breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.pending}</span>Pending</div>
          <div className={styles.vizBox}><span>{data.kpis.confirmed}</span>Confirmed</div>
          <div className={styles.vizBox}><span>{data.kpis.completed}</span>Completed</div>
          <div className={styles.vizBox}><span>{data.kpis.cancelled}</span>Cancelled</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Tier breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.byTier.hot}</span>Hot</div>
          <div className={styles.vizBox}><span>{data.byTier.warm}</span>Warm</div>
          <div className={styles.vizBox}><span>{data.byTier.cool}</span>Cool</div>
          <div className={styles.vizBox}><span>{data.byTier.cold}</span>Cold</div>
        </div>
      </div>
    </div>
  );
}
