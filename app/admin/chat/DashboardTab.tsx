'use client';

import { useEffect, useState } from 'react';
import styles from './ChatShared.module.css';

interface DashboardData {
  kpis: { totalSessions: number; activeSessions: number; totalRequests: number; unscoredRequests: number; avgResponseQualityScore: number; totalRuns: number };
  evalStats: { total: number; passed: number; failed: number };
  byRequestStatus: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/chat/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalSessions}</span>Total sessions</div>
          <div className={styles.vizBox}><span>{data.kpis.activeSessions}</span>Active sessions</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRequests}</span>Total requests</div>
          <div className={styles.vizBox}><span>{data.kpis.avgResponseQualityScore}</span>Avg response quality</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Message evaluations (chat_message_evals)</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.evalStats.total}</span>Total evals</div>
          <div className={styles.vizBox}><span>{data.evalStats.passed}</span>Passed</div>
          <div className={styles.vizBox}><span>{data.evalStats.failed}</span>Failed</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Requests by status</h4>
        <p>{Object.entries(data.byRequestStatus).map(([s, n]) => `${s}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
    </div>
  );
}
