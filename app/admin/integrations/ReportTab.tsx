'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './IntegrationsShared.module.css';

interface AccountRow { name: string; status: string; hasCredentials: boolean; readinessScore: number | null }
interface ReportData { generatedAt: string; totalAccounts: number; accounts: AccountRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/integrations/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Integration Accounts Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalAccounts} total accounts.</p>
      {data.accounts.length === 0 && <p className={styles.empty}>No accounts yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Status</th><th>Has Credentials</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.accounts.map((a, i) => (
            <tr key={i}>
              <td>{a.name}</td>
              <td><Badge variant={a.status === 'connected' ? 'success' : 'default'}>{a.status}</Badge></td>
              <td>{a.hasCredentials ? 'Yes' : 'No'}</td>
              <td>{a.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
