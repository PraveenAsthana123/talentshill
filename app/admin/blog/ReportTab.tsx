'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './BlogShared.module.css';

interface PostRow { title: string; status: string; seoReadinessScore: number | null; hasMetaTitle: boolean; hasMetaDescription: boolean; hasCoverImage: boolean }
interface ReportData { generatedAt: string; totalPosts: number; posts: PostRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/blog/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Posts Report (by SEO readiness)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalPosts} total posts.</p>
      {data.posts.length === 0 && <p className={styles.empty}>No posts yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Status</th><th>Readiness</th><th>Meta Title</th><th>Meta Desc</th><th>Cover</th></tr></thead>
        <tbody>
          {data.posts.map((p, i) => (
            <tr key={i}>
              <td>{p.title}</td>
              <td><Badge variant={p.status === 'published' ? 'success' : 'default'}>{p.status}</Badge></td>
              <td>{p.seoReadinessScore ?? '—'}</td>
              <td>{p.hasMetaTitle ? 'Yes' : 'No'}</td>
              <td>{p.hasMetaDescription ? 'Yes' : 'No'}</td>
              <td>{p.hasCoverImage ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
