'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './MaintenanceShared.module.css';

interface CheckRow { score: number; enabled: boolean; enforcementMatchesExpected: boolean; observedStatusCode: number | null; createdAt: string }
interface ReportData { generatedAt: string; totalChecks: number; checks: CheckRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/maintenance/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Enforcement Check Report (by check)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalChecks} checks recorded.</p>
      {data.checks.length === 0 && <p className={styles.empty}>No checks yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>When</th><th>Score</th><th>Enabled</th><th>Enforcement OK</th><th>Observed Status</th></tr></thead>
        <tbody>
          {data.checks.map((c, i) => (
            <tr key={i}>
              <td>{new Date(c.createdAt).toLocaleString()}</td><td>{c.score}</td><td>{c.enabled ? 'Yes' : 'No'}</td>
              <td><Badge variant={c.enforcementMatchesExpected ? 'success' : 'error'}>{c.enforcementMatchesExpected ? 'OK' : 'MISMATCH'}</Badge></td>
              <td>{c.observedStatusCode ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
