'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './BroadcastsShared.module.css';

interface BroadcastRow { name: string; status: string; audienceType: string; readinessScore: number | null; totalSent: number; totalFailed: number }
interface ReportData { generatedAt: string; totalBroadcasts: number; broadcasts: BroadcastRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/broadcasts/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Broadcasts Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalBroadcasts} total broadcasts.</p>
      {data.broadcasts.length === 0 && <p className={styles.empty}>No broadcasts yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Status</th><th>Audience</th><th>Readiness Score</th><th>Sent</th><th>Failed</th></tr></thead>
        <tbody>
          {data.broadcasts.map((b, i) => (
            <tr key={i}>
              <td>{b.name}</td>
              <td><Badge variant={b.status === 'completed' ? 'success' : b.status === 'sending' ? 'accent' : 'default'}>{b.status}</Badge></td>
              <td>{b.audienceType}</td>
              <td>{b.readinessScore ?? '—'}</td>
              <td>{b.totalSent}</td>
              <td>{b.totalFailed}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
