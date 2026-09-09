'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './ServicesShared.module.css';

interface ServiceRow { name: string; category: string; isActive: boolean; contentScore: number | null }
interface ReportData { generatedAt: string; totalServices: number; services: ServiceRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/services/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Services Report (by content score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalServices} total services.</p>
      {data.services.length === 0 && <p className={styles.empty}>No services yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Content Score</th></tr></thead>
        <tbody>
          {data.services.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td><td>{s.category}</td>
              <td><Badge variant={s.isActive ? 'success' : 'default'}>{s.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{s.contentScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
