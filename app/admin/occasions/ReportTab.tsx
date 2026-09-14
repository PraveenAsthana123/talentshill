'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './OccasionsShared.module.css';

interface MessageRow { contactId: string; occasionType: string; festivalCode: string | null; channel: string; status: string; triggeredAt: string }
interface ReportData { generatedAt: string; totalMessages: number; messages: MessageRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/occasions/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Occasion Messages Report</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalMessages} total logged (most recent 200 shown).</p>
      {data.messages.length === 0 ? <p className={styles.empty}>No occasion messages logged yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Contact</th><th>Type</th><th>Festival</th><th>Channel</th><th>Status</th><th>Triggered</th></tr></thead>
          <tbody>
            {data.messages.map((m, i) => (
              <tr key={i}>
                <td>{m.contactId.slice(0, 8)}</td>
                <td>{m.occasionType}</td>
                <td>{m.festivalCode ?? '—'}</td>
                <td>{m.channel}</td>
                <td><Badge variant={m.status === 'logged' ? 'success' : 'error'}>{m.status}</Badge></td>
                <td>{new Date(m.triggeredAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
