'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './MediaShared.module.css';

interface MediaRow { originalName: string; mimeType: string; size: number; isActive: boolean; readinessScore: number | null }
interface ReportData { generatedAt: string; totalMedia: number; media: MediaRow[] }

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/media/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Media Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalMedia} total files.</p>
      {data.media.length === 0 && <p className={styles.empty}>No files yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>Active</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.media.map((m, i) => (
            <tr key={i}>
              <td>{m.originalName}</td>
              <td>{m.mimeType}</td>
              <td>{formatBytes(m.size)}</td>
              <td><Badge variant={m.isActive ? 'success' : 'default'}>{m.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{m.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
