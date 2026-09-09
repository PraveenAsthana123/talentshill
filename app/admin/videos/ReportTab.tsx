'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './VideosShared.module.css';

interface VideoRow { title: string; category: string | null; isActive: boolean; contentScore: number | null }
interface ReportData { generatedAt: string; totalVideos: number; videos: VideoRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/videos/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Videos Report (by content score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalVideos} total videos.</p>
      {data.videos.length === 0 && <p className={styles.empty}>No videos yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Content Score</th></tr></thead>
        <tbody>
          {data.videos.map((v, i) => (
            <tr key={i}>
              <td>{v.title}</td><td>{v.category || '—'}</td>
              <td><Badge variant={v.isActive ? 'success' : 'default'}>{v.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{v.contentScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
