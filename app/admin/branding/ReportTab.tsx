'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './BrandingShared.module.css';

interface AssetRow { name: string; category: string; status: string; version: number; readinessScore: number | null }
interface ReportData { generatedAt: string; totalAssets: number; assets: AssetRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/branding/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Asset Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalAssets} total assets.</p>
      {data.assets.length === 0 && <p className={styles.empty}>No assets yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Version</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.assets.map((a, i) => (
            <tr key={i}>
              <td>{a.name}</td><td>{a.category}</td>
              <td><Badge variant={a.status === 'approved' ? 'success' : 'default'}>{a.status}</Badge></td>
              <td>v{a.version}</td><td>{a.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
