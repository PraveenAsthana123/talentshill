'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './ComposeShared.module.css';

interface LogRow { to: string; subject: string; sent: boolean; readinessScore: number | null; createdAt: string }
interface ReportData { generatedAt: string; totalComposeLogs: number; logs: LogRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/email-compose/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Compose Log Report (most recent first)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalComposeLogs} total log entries.</p>
      {data.logs.length === 0 && <p className={styles.empty}>No compose activity yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>When</th><th>To</th><th>Subject</th><th>Sent</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.logs.map((l, i) => (
            <tr key={i}>
              <td>{new Date(l.createdAt).toLocaleString()}</td><td>{l.to}</td><td>{l.subject}</td>
              <td><Badge variant={l.sent ? 'success' : 'default'}>{l.sent ? 'sent' : 'not sent'}</Badge></td>
              <td>{l.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
