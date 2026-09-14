'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './AdsManagementShared.module.css';

interface CampaignRow { name: string; platform: string; status: string; budget: number | null; spend: number | null; readinessScore: number | null }
interface BudgetSuggestion { campaignId: string; name: string; platform: string; roas: number | null; action: string; suggestedDeltaPct: number; reason: string }
interface ReportData { generatedAt: string; totalCampaigns: number; campaigns: CampaignRow[]; budgetOptimization: { scoredCampaigns: number; unscoredCampaigns: number; suggestions: BudgetSuggestion[] } }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/ads-management/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Campaign Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalCampaigns} total campaigns.</p>
      {data.campaigns.length === 0 && <p className={styles.empty}>No campaigns yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Platform</th><th>Status</th><th>Budget</th><th>Spend</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.campaigns.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td>
              <td>{c.platform}</td>
              <td><Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge></td>
              <td>{c.budget ?? '—'}</td>
              <td>{c.spend ?? '—'}</td>
              <td>{c.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 style={{ marginTop: 'var(--space-5)' }}>Budget Optimization Summary</h4>
      <p>{data.budgetOptimization.scoredCampaigns} campaign(s) with real logged metrics, {data.budgetOptimization.unscoredCampaigns} awaiting data.</p>
      {data.budgetOptimization.suggestions.length === 0 ? <p className={styles.empty}>No scored campaigns yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Campaign</th><th>Platform</th><th>ROAS</th><th>Recommendation</th></tr></thead>
          <tbody>
            {data.budgetOptimization.suggestions.map((s) => (
              <tr key={s.campaignId}>
                <td>{s.name}</td><td>{s.platform}</td><td>{s.roas === null ? 'No data' : s.roas.toFixed(2)}</td>
                <td><Badge variant={s.action === 'increase' ? 'success' : s.action === 'decrease' ? 'warning' : 'default'}>{s.action} {s.suggestedDeltaPct !== 0 ? `${s.suggestedDeltaPct}%` : ''}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
