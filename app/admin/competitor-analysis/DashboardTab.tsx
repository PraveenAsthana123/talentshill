'use client';

import { useEffect, useState } from 'react';
import styles from './AdminCompetitorAnalysis.module.css';

interface DashboardData {
  kpis: {
    totalServices: number;
    servicesCovered: number;
    servicesUncovered: number;
    coveragePercent: number;
    totalRealEntries: number;
    needsResearch: number;
    researched: number;
    monitoring: number;
    totalRuns: number;
    aiDraftedPendingReview: number;
  };
  uncoveredServices: { id: string; name: string; category: string }[];
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/competitor-analysis/dashboard/')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.coveragePercent}%</span>Services with competitor research</div>
          <div className={styles.vizBox}><span>{data.kpis.servicesCovered}/{data.kpis.totalServices}</span>Services covered</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRealEntries}</span>Real research entries</div>
        </div>
      </div>

      <div className={styles.subSection}>
        <h4>Research status breakdown</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.needsResearch}</span>Needs research</div>
          <div className={styles.vizBox}><span>{data.kpis.researched}</span>Researched</div>
          <div className={styles.vizBox}><span>{data.kpis.monitoring}</span>Monitoring</div>
        </div>
      </div>

      <div className={styles.subSection}>
        <h4>Automation activity</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
          <div className={styles.vizBox}><span>{data.kpis.aiDraftedPendingReview}</span>AI-drafted, pending human review</div>
        </div>
      </div>

      <div className={styles.subSection}>
        <h4>Services with zero competitor research</h4>
        {data.uncoveredServices.length === 0 && <p className={styles.empty}>All active services have at least one entry.</p>}
        <ul>
          {data.uncoveredServices.map((s) => <li key={s.id}>{s.name} ({s.category})</li>)}
        </ul>
      </div>
    </div>
  );
}
