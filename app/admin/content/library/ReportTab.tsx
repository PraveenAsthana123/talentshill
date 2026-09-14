'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './ContentShared.module.css';

interface ContentRow { title: string; contentType: string; status: string; readinessScore: number | null }
interface PerformanceSuggestion { contentId: string; title: string; contentType: string; conversionRate: number | null; action: string }
interface ReportData { generatedAt: string; totalContent: number; content: ContentRow[]; performance: { scoredContent: number; unscoredContent: number; suggestions: PerformanceSuggestion[] } }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/content/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/content/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

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

      <h4 style={{ marginTop: 'var(--space-5)' }}>Content Performance Summary</h4>
      <p>{data.performance.scoredContent} content item(s) with real logged engagement, {data.performance.unscoredContent} awaiting data.</p>
      {data.performance.suggestions.length === 0 ? <p className={styles.empty}>No scored content yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Title</th><th>Type</th><th>Conversion</th><th>Recommendation</th></tr></thead>
          <tbody>{data.performance.suggestions.map((s) => (
            <tr key={s.contentId}><td>{s.title}</td><td>{s.contentType}</td><td>{s.conversionRate === null ? 'No data' : `${(s.conversionRate * 100).toFixed(1)}%`}</td><td><Badge variant={s.action === 'produce_more' ? 'success' : s.action === 'deprioritize' ? 'warning' : 'default'}>{s.action}</Badge></td></tr>
          ))}</tbody>
        </table>
      )}

      <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
      {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
    </div>
  );
}
