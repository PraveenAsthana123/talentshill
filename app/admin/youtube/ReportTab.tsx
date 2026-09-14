'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './YoutubeShared.module.css';

interface VideoRow { title: string; status: string; externalVideoId: string | null; readinessScore: number | null }
interface SnapshotRow { snapshotDate: string; subscriberCount: number; totalViews: number; totalWatchTimeMinutes: number | null; notes: string | null }
interface ReportData { generatedAt: string; totalVideos: number; videos: VideoRow[]; channelSnapshots: SnapshotRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/youtube/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/youtube/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Video Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalVideos} total videos.</p>
      {data.videos.length === 0 && <p className={styles.empty}>No videos yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Status</th><th>Real Video ID</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.videos.map((v, i) => (
            <tr key={i}>
              <td>{v.title}</td>
              <td><Badge variant={v.status === 'published' ? 'success' : 'default'}>{v.status}</Badge></td>
              <td>{v.externalVideoId || '—'}</td>
              <td>{v.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 'var(--space-5)' }}>Channel Growth Report</h4>
      {data.channelSnapshots.length === 0 ? <p className={styles.empty}>No channel snapshots yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Date</th><th>Subscribers</th><th>Total Views</th><th>Watch Time (min)</th></tr></thead>
          <tbody>
            {data.channelSnapshots.map((s, i) => (
              <tr key={i}>
                <td>{new Date(s.snapshotDate).toLocaleDateString()}</td>
                <td>{s.subscriberCount.toLocaleString()}</td>
                <td>{s.totalViews.toLocaleString()}</td>
                <td>{s.totalWatchTimeMinutes ?? '—'}</td>
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
