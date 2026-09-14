'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './MarketResearchShared.module.css';

interface BriefRow { title: string; topic: string; status: string; readinessScore: number | null }
interface ReportData { generatedAt: string; totalBriefs: number; briefs: BriefRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/market-research/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Brief Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalBriefs} total briefs.</p>
      {data.briefs.length === 0 && <p className={styles.empty}>No briefs yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Topic</th><th>Status</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.briefs.map((b, i) => (
            <tr key={i}>
              <td>{b.title}</td><td>{b.topic}</td>
              <td><Badge variant={b.status === 'published' ? 'success' : 'default'}>{b.status}</Badge></td>
              <td>{b.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
