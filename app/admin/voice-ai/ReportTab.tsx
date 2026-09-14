'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './VoiceAiShared.module.css';

interface AssetRow { title: string; type: string; status: string; durationSeconds: number | null; readinessScore: number | null }
interface CallRow { direction: string; callDate: string; durationSeconds: number | null; qualificationScore: number | null; qualificationTier: string | null; contactLinked: boolean }
interface ReportData { generatedAt: string; totalAssets: number; assets: AssetRow[]; calls: CallRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/voice-ai/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/voice-ai/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Asset Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalAssets} total assets.</p>
      {data.assets.length === 0 && <p className={styles.empty}>No assets yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Duration (s)</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.assets.map((a, i) => (
            <tr key={i}>
              <td>{a.title}</td><td>{a.type}</td>
              <td><Badge variant={a.status === 'approved' ? 'success' : 'default'}>{a.status}</Badge></td>
              <td>{a.durationSeconds ?? '—'}</td><td>{a.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 'var(--space-5)' }}>Call Qualification Report</h4>
      {data.calls.length === 0 ? <p className={styles.empty}>No calls logged yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Direction</th><th>Date</th><th>Duration (s)</th><th>Qualification</th><th>Contact Linked</th></tr></thead>
          <tbody>
            {data.calls.map((c, i) => (
              <tr key={i}>
                <td>{c.direction}</td><td>{new Date(c.callDate).toLocaleString()}</td><td>{c.durationSeconds ?? '—'}</td>
                <td>{c.qualificationTier ? `${c.qualificationTier} (${c.qualificationScore})` : '—'}</td>
                <td>{c.contactLinked ? 'Yes' : 'No'}</td>
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
