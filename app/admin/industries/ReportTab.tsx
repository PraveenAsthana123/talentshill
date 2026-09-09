'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './IndustriesShared.module.css';

interface IndustryRow { name: string; isActive: boolean; contentScore: number | null; hasIcon: boolean }
interface ReportData { generatedAt: string; totalIndustries: number; industries: IndustryRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/industries/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Industries Report (by content score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalIndustries} total industries.</p>
      {data.industries.length === 0 && <p className={styles.empty}>No industries yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Status</th><th>Content Score</th><th>Has Icon</th></tr></thead>
        <tbody>
          {data.industries.map((i, idx) => (
            <tr key={idx}>
              <td>{i.name}</td>
              <td><Badge variant={i.isActive ? 'success' : 'default'}>{i.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{i.contentScore ?? '—'}</td>
              <td>{i.hasIcon ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
