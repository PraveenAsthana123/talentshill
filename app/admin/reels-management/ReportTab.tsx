'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './ReelsManagementShared.module.css';

interface ReelRow { title: string; platform: string; status: string; scheduledAt: string | null; readinessScore: number | null }
interface ReportData { generatedAt: string; totalReels: number; reels: ReelRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/reels-management/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Reel Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalReels} total reels.</p>
      {data.reels.length === 0 && <p className={styles.empty}>No reels yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Platform</th><th>Status</th><th>Scheduled</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.reels.map((r, i) => (
            <tr key={i}>
              <td>{r.title}</td><td>{r.platform}</td>
              <td><Badge variant={r.status === 'published' ? 'success' : 'default'}>{r.status}</Badge></td>
              <td>{r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString() : '—'}</td>
              <td>{r.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
