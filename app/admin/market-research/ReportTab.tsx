'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './MarketResearchShared.module.css';

interface BriefRow { title: string; topic: string; status: string; readinessScore: number | null }
interface RankedRow { rank: number | null; title: string; opportunityScore: number | null; somEstimateUsd: number | null; competitionLevel: string | null; riskLevel: string | null; strategicFitScore: number | null }
interface ReportData { generatedAt: string; totalBriefs: number; briefs: BriefRow[]; opportunityRanking: RankedRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/market-research/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/market-research/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Brief Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalBriefs} total briefs.</p>
      {data.briefs.length === 0 && <p className={styles.empty}>No briefs yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Topic</th><th>Status</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.briefs.map((b, i) => (
            <tr key={i}>
              <td>{b.title}</td><td>{b.topic}</td>
              <td><Badge variant={b.status === 'published' ? 'success' : 'default'}>{b.status}</Badge></td>
              <td>{b.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 'var(--space-5)' }}>Opportunity Ranking</h4>
      {data.opportunityRanking.length === 0 ? <p className={styles.empty}>No briefs scored yet — run Opportunity Scoring in the Pipeline tab.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Rank</th><th>Title</th><th>Score</th><th>SOM Estimate</th><th>Competition</th><th>Risk</th><th>Strategic Fit</th></tr></thead>
          <tbody>
            {data.opportunityRanking.map((r, i) => (
              <tr key={i}>
                <td>{r.rank}</td><td>{r.title}</td><td>{r.opportunityScore}/100</td>
                <td>{r.somEstimateUsd !== null ? `$${r.somEstimateUsd.toLocaleString()}` : '—'}</td>
                <td>{r.competitionLevel ?? '—'}</td><td>{r.riskLevel ?? '—'}</td><td>{r.strategicFitScore ?? '—'}/100</td>
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
