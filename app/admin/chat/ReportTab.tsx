'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './ChatShared.module.css';

interface RequestRow {
  subject: string | null; status: string; priority: string; responseQualityScore: number | null;
  qualificationScore: number | null; qualificationTier: string | null; contactLinked: boolean;
}
interface ReportData { generatedAt: string; totalRequests: number; requests: RequestRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/chat/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/chat/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Requests Report (by response quality score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalRequests} total requests.</p>
      {data.requests.length === 0 && <p className={styles.empty}>No requests yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Subject</th><th>Status</th><th>Priority</th><th>Response Quality Score</th><th>Sales Qualification</th><th>Contact Linked</th></tr></thead>
        <tbody>
          {data.requests.map((r, i) => (
            <tr key={i}>
              <td>{r.subject || 'No subject'}</td>
              <td><Badge variant={r.status === 'resolved' || r.status === 'closed' ? 'success' : 'default'}>{r.status}</Badge></td>
              <td>{r.priority}</td>
              <td>{r.responseQualityScore ?? '—'}</td>
              <td>{r.qualificationTier ? `${r.qualificationTier} (${r.qualificationScore})` : '—'}</td>
              <td>{r.contactLinked ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
      {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
    </div>
  );
}
