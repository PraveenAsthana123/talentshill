'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './FeaturesShared.module.css';

interface FlagRow { key: string; label: string; module: string | null; isEnabled: boolean; readinessScore: number | null }
interface ReportData { generatedAt: string; totalFlags: number; flags: FlagRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/features/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Feature Flags Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalFlags} total flags.</p>
      {data.flags.length === 0 && <p className={styles.empty}>No flags yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Key</th><th>Label</th><th>Module</th><th>Status</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.flags.map((f, i) => (
            <tr key={i}>
              <td>{f.key}</td><td>{f.label}</td><td>{f.module || '—'}</td>
              <td><Badge variant={f.isEnabled ? 'success' : 'default'}>{f.isEnabled ? 'enabled' : 'disabled'}</Badge></td>
              <td>{f.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
