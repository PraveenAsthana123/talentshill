'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './ModuleRegistryShared.module.css';

interface ModuleRow { name: string; builtStatus: string; lastVerifiedAt: string | null; driftScore: number | null }
interface ReportData { generatedAt: string; totalModules: number; modules: ModuleRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/module-registry/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Module Registry Report (by drift score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalModules} total modules.</p>
      {data.modules.length === 0 && <p className={styles.empty}>No modules yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Status</th><th>Last verified</th><th>Drift Score</th></tr></thead>
        <tbody>
          {data.modules.map((m, i) => (
            <tr key={i}>
              <td>{m.name}</td>
              <td><Badge variant={m.builtStatus === 'real' ? 'success' : m.builtStatus === 'partial' ? 'warning' : 'default'}>{m.builtStatus}</Badge></td>
              <td>{m.lastVerifiedAt ? new Date(m.lastVerifiedAt).toLocaleDateString() : 'Never'}</td>
              <td>{m.driftScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
