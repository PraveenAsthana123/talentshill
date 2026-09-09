'use client';

import { useEffect, useState } from 'react';
import styles from './RagShared.module.css';

interface DashboardData {
  kpis: { totalDocuments: number; totalChunks: number; totalEmbeddings: number; unscored: number; avgReadinessScore: number; totalRuns: number };
  byStatus: Record<string, number>;
  embeddingProvider: string;
}

export default function DashboardTab() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/rag/dashboard/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Corpus &amp; scoring coverage</h4>
        <div className={styles.vizRow}>
          <div className={styles.vizBox}><span>{data.kpis.totalDocuments}</span>Total documents</div>
          <div className={styles.vizBox}><span>{data.kpis.totalChunks}</span>Total chunks</div>
          <div className={styles.vizBox}><span>{data.kpis.totalEmbeddings}</span>Total embeddings</div>
          <div className={styles.vizBox}><span>{data.kpis.unscored}</span>Unscored</div>
          <div className={styles.vizBox}><span>{data.kpis.avgReadinessScore}</span>Avg readiness</div>
          <div className={styles.vizBox}><span>{data.kpis.totalRuns}</span>Total operation runs</div>
        </div>
      </div>
      <div className={styles.subSection}>
        <h4>By document status</h4>
        <p>{Object.entries(data.byStatus).map(([s, n]) => `${s}: ${n}`).join(' · ') || 'None yet.'}</p>
      </div>
      <div className={styles.subSection}>
        <h4>Embedding provider</h4>
        <p>{data.embeddingProvider}</p>
      </div>
    </div>
  );
}
