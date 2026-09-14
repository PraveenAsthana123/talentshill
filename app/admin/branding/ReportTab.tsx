'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './BrandingShared.module.css';

interface AssetRow { name: string; category: string; status: string; version: number; readinessScore: number | null }
interface SnapshotRow { snapshotDate: string; healthScore: number; label: string | null; positiveMentions: number; neutralMentions: number; negativeMentions: number; competitorsTracked: number }
interface ReportData { generatedAt: string; totalAssets: number; assets: AssetRow[]; healthSnapshots: SnapshotRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/branding/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/branding/share-link/', { method: 'POST' });
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
        <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Version</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.assets.map((a, i) => (
            <tr key={i}>
              <td>{a.name}</td><td>{a.category}</td>
              <td><Badge variant={a.status === 'approved' ? 'success' : 'default'}>{a.status}</Badge></td>
              <td>v{a.version}</td><td>{a.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 'var(--space-5)' }}>Brand Health Snapshots</h4>
      {data.healthSnapshots.length === 0 ? <p className={styles.empty}>No snapshots yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>Label</th><th>Score</th><th>Positive</th><th>Neutral</th><th>Negative</th><th>Competitors</th></tr></thead>
          <tbody>
            {data.healthSnapshots.map((s, i) => (
              <tr key={i}><td>{new Date(s.snapshotDate).toLocaleDateString()}</td><td>{s.label ?? '—'}</td><td>{s.healthScore}</td><td>{s.positiveMentions}</td><td>{s.neutralMentions}</td><td>{s.negativeMentions}</td><td>{s.competitorsTracked}</td></tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
      {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
    </div>
  );
}
