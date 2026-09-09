'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './RagShared.module.css';

interface DocRow { name: string; sourceType: string; status: string; chunkCount: number | null; readinessScore: number | null }
interface ReportData { generatedAt: string; totalDocuments: number; documents: DocRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/rag/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Document Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalDocuments} total documents.</p>
      {data.documents.length === 0 && <p className={styles.empty}>No documents yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Source</th><th>Status</th><th>Chunks</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.documents.map((d, i) => (
            <tr key={i}>
              <td>{d.name}</td>
              <td>{d.sourceType}</td>
              <td><Badge variant={d.status === 'embedded' || d.status === 'ready' ? 'success' : d.status === 'failed' ? 'error' : 'default'}>{d.status}</Badge></td>
              <td>{d.chunkCount ?? 0}</td>
              <td>{d.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
