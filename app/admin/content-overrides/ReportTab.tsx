'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './OverridesShared.module.css';

interface OverrideRow { pageSlug: string; section: string; key: string; isActive: boolean; safetyScore: number | null }
interface ReportData { generatedAt: string; totalOverrides: number; overrides: OverrideRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/content-overrides/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Overrides Report (by safety score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalOverrides} total overrides.</p>
      {data.overrides.length === 0 && <p className={styles.empty}>No overrides yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Page</th><th>Section</th><th>Key</th><th>Active</th><th>Safety Score</th></tr></thead>
        <tbody>
          {data.overrides.map((o, i) => (
            <tr key={i}>
              <td>{o.pageSlug}</td><td>{o.section}</td><td>{o.key}</td>
              <td><Badge variant={o.isActive ? 'success' : 'default'}>{o.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{o.safetyScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
