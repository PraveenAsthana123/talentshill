'use client';

import { useEffect, useState } from 'react';
import styles from './VoiceAiShared.module.css';

interface DashboardData {
  kpis: {
    totalAssets: number; approved: number; unscored: number; avgReadinessScore: number; totalRuns: number;
    totalCalls: number; qualifiedCalls: number; hotCalls: number; contactsLinkedFromCalls: number;
  };
  byType: Record<string, number>;
  byCallTier: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/voice-ai/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalAssets}</span>Total assets</div>
          <div className={styles.vizBox}><span>{data.kpis.approved}</span>Approved</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Voice call lead qualification</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalCalls}</span>Calls logged</div>
          <div className={styles.vizBox}><span>{data.kpis.qualifiedCalls}</span>Calls scored</div>
          <div className={styles.vizBox}><span>{data.kpis.hotCalls}</span>Hot</div>
          <div className={styles.vizBox}><span>{data.kpis.contactsLinkedFromCalls}</span>Contacts linked from calls</div>
        </div>
        <p>By tier: {Object.entries(data.byCallTier).map(([t, n]) => `${t}: ${n}`).join(' · ') || 'None scored yet.'}</p>
      </div>
      <div className={styles.subSection}><h4>By type</h4><p>{Object.entries(data.byType).map(([t, n]) => `${t}: ${n}`).join(' · ') || 'None yet.'}</p></div>
    </div>
  );
}
