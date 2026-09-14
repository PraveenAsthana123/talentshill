'use client';

import { useEffect, useState } from 'react';
import styles from './MarketResearchShared.module.css';

interface DashboardData {
  kpis: {
    totalBriefs: number; published: number; unscored: number; avgReadinessScore: number; totalRuns: number;
    opportunityScoredCount: number; avgOpportunityScore: number;
    topOpportunity: { title: string; opportunityScore: number; opportunityRank: number } | null;
  };
  byStatus: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/market-research/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalBriefs}</span>Total briefs</div>
          <div className={styles.vizBox}><span>{data.kpis.published}</span>Published</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Opportunity scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.opportunityScoredCount}</span>Briefs opportunity-scored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgOpportunityScore}</span>Avg opportunity score</div>
        </div>
        {data.kpis.topOpportunity ? (
          <p>Top-ranked opportunity: <strong>{data.kpis.topOpportunity.title}</strong> — rank #{data.kpis.topOpportunity.opportunityRank}, score {data.kpis.topOpportunity.opportunityScore}/100</p>
        ) : (
          <p>No briefs have complete opportunity-scoring inputs yet.</p>
        )}
      </div>
      <div className={styles.subSection}><h4>By status</h4><p>{Object.entries(data.byStatus).map(([s, n]) => `${s}: ${n}`).join(' · ') || 'None yet.'}</p></div>
    </div>
  );
}
