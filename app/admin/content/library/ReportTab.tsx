'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './ContentShared.module.css';

interface ContentRow { title: string; contentType: string; status: string; readinessScore: number | null }
interface ReportData { generatedAt: string; totalContent: number; content: ContentRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/content/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Content Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalContent} total content items.</p>
      {data.content.length === 0 && <p className={styles.empty}>No content yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.content.map((c, i) => (
            <tr key={i}>
              <td>{c.title}</td><td>{c.contentType}</td>
              <td><Badge variant={c.status === 'published' ? 'success' : 'default'}>{c.status}</Badge></td>
              <td>{c.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
