'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './InfluencerVideoShared.module.css';

interface CampaignRow { influencerName: string; platform: string; status: string; agreedFee: number | null; readinessScore: number | null }
interface RoiSuggestion { campaignId: string; influencerName: string; platform: string; roi: number | null; action: string }
interface ReportData { generatedAt: string; totalCampaigns: number; campaigns: CampaignRow[]; roiScoring: { scoredCreators: number; unscoredCreators: number; suggestions: RoiSuggestion[] } }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/influencer-video/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/influencer-video/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Campaign Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalCampaigns} total campaigns.</p>
      {data.campaigns.length === 0 && <p className={styles.empty}>No campaigns yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Influencer</th><th>Platform</th><th>Status</th><th>Fee</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.campaigns.map((c, i) => (
            <tr key={i}>
              <td>{c.influencerName}</td><td>{c.platform}</td>
              <td><Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge></td>
              <td>{c.agreedFee ?? '—'}</td><td>{c.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 'var(--space-5)' }}>Creator ROI Summary</h4>
      <p>{data.roiScoring.scoredCreators} creator(s) with real logged metrics, {data.roiScoring.unscoredCreators} awaiting data.</p>
      {data.roiScoring.suggestions.length === 0 ? <p className={styles.empty}>No scored creators yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Creator</th><th>Platform</th><th>ROI</th><th>Recommendation</th></tr></thead>
          <tbody>{data.roiScoring.suggestions.map((s) => (
            <tr key={s.campaignId}><td>{s.influencerName}</td><td>{s.platform}</td><td>{s.roi === null ? 'No data' : `${(s.roi * 100).toFixed(0)}%`}</td><td><Badge variant={s.action === 'renew' ? 'success' : s.action === 'drop' ? 'warning' : 'default'}>{s.action}</Badge></td></tr>
          ))}</tbody>
        </table>
      )}

      <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
      {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
    </div>
  );
}
