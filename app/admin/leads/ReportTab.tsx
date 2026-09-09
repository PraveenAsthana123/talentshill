'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './LeadsShared.module.css';

interface LeadRow { fullName: string; company: string; industry: string; leadScore: number; leadTier: string; status: string }
interface ReportData { generatedAt: string; totalLeads: number; topLeads: LeadRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/leads/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Top Leads Report (by score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalLeads} total leads.</p>
      {data.topLeads.length === 0 && <p className={styles.empty}>No leads yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Company</th><th>Industry</th><th>Score</th><th>Tier</th><th>Status</th></tr></thead>
        <tbody>
          {data.topLeads.map((l, i) => (
            <tr key={i}>
              <td>{l.fullName}</td><td>{l.company}</td><td>{l.industry}</td>
              <td>{l.leadScore}</td>
              <td><Badge variant={l.leadTier === 'hot' ? 'success' : l.leadTier === 'warm' ? 'accent' : 'default'}>{l.leadTier}</Badge></td>
              <td>{l.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
