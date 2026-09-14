'use client';

import { useEffect, useState } from 'react';
import styles from './VideoEditingShared.module.css';

interface DashboardData {
  kpis: {
    totalProjects: number; published: number; unscored: number; avgReadinessScore: number; totalRuns: number;
    totalClipPlans: number; deliveredClips: number; avgClipReadinessScore: number;
  };
  byTool: Record<string, number>;
  byStatus: Record<string, number>;
  byClipStatus: Record<string, number>;
  byClipPlatform: Record<string, number>;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/video-editing/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Volume &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalProjects}</span>Total projects</div>
          <div className={styles.vizBox}><span>{data.kpis.published}</span>Published</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>Video Repurposing Factory</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalClipPlans}</span>Clip plans</div>
          <div className={styles.vizBox}><span>{data.kpis.deliveredClips}</span>Delivered</div>
          <div className={styles.vizBox}><span>{data.kpis.avgClipReadinessScore}</span>Avg clip readiness</div>
        </div>
        <p>By status: {Object.entries(data.byClipStatus).map(([s, n]) => `${s}: ${n}`).join(' · ') || 'None yet.'}</p>
        <p>By platform: {Object.entries(data.byClipPlatform).map(([p, n]) => `${p}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
      <div className={styles.subSection}><h4>By tool</h4><p>{Object.entries(data.byTool).map(([t, n]) => `${t}: ${n}`).join(' · ') || 'None yet.'}</p></div>
      <div className={styles.subSection}><h4>By status</h4><p>{Object.entries(data.byStatus).map(([s, n]) => `${s}: ${n}`).join(' · ') || 'None yet.'}</p></div>
    </div>
  );
}
