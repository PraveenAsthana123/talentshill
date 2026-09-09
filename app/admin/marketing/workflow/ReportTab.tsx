'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './WorkflowShared.module.css';

interface WorkflowRow { name: string; status: string; currentStep: number; readinessScore: number | null }
interface ReportData { generatedAt: string; totalWorkflows: number; workflows: WorkflowRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/marketing/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Workflows Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalWorkflows} total workflows.</p>
      {data.workflows.length === 0 && <p className={styles.empty}>No workflows yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Status</th><th>Step</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.workflows.map((w, i) => (
            <tr key={i}>
              <td>{w.name}</td>
              <td><Badge variant={w.status === 'completed' ? 'success' : w.status === 'approved' ? 'accent' : 'default'}>{w.status}</Badge></td>
              <td>{w.currentStep + 1}/8</td>
              <td>{w.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
