'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './BroadcastsShared.module.css';

interface BroadcastRow { name: string; status: string; audienceType: string; readinessScore: number | null; totalSent: number; totalFailed: number }
interface ReEngagementRow { channel: string; triggerReason: string; status: string; triggeredAt: string }
interface ReportData { generatedAt: string; totalBroadcasts: number; broadcasts: BroadcastRow[]; reEngagementMessages: ReEngagementRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/broadcasts/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/broadcasts/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Broadcasts Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalBroadcasts} total broadcasts.</p>
      {data.broadcasts.length === 0 && <p className={styles.empty}>No broadcasts yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Status</th><th>Audience</th><th>Readiness Score</th><th>Sent</th><th>Failed</th></tr></thead>
        <tbody>
          {data.broadcasts.map((b, i) => (
            <tr key={i}>
              <td>{b.name}</td>
              <td><Badge variant={b.status === 'completed' ? 'success' : b.status === 'sending' ? 'accent' : 'default'}>{b.status}</Badge></td>
              <td>{b.audienceType}</td>
              <td>{b.readinessScore ?? '—'}</td>
              <td>{b.totalSent}</td>
              <td>{b.totalFailed}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 'var(--space-5)' }}>Re-engagement Messages Report</h4>
      {data.reEngagementMessages.length === 0 ? <p className={styles.empty}>No re-engagement messages triggered yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Channel</th><th>Trigger Reason</th><th>Status</th><th>Triggered</th></tr></thead>
          <tbody>
            {data.reEngagementMessages.map((m, i) => (
              <tr key={i}>
                <td>{m.channel}</td><td>{m.triggerReason}</td>
                <td><Badge variant={m.status === 'logged' ? 'success' : 'error'}>{m.status}</Badge></td>
                <td>{new Date(m.triggeredAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
      {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
    </div>
  );
}
