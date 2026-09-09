'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './AnalysisShared.module.css';

interface AssessmentRow { projectName: string; status: string; completedItems: number; totalItems: number; overallScore: number | null; healthScore: number | null; updatedAt: string }
interface ReportData { generatedAt: string; totalAssessments: number; assessments: AssessmentRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analysis/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Assessments Report (by health score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalAssessments} total assessments.</p>
      {data.assessments.length === 0 && <p className={styles.empty}>No assessments yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Project</th><th>Status</th><th>Items</th><th>Overall Score</th><th>Health Score</th></tr></thead>
        <tbody>
          {data.assessments.map((a, i) => (
            <tr key={i}>
              <td>{a.projectName}</td>
              <td><Badge variant={a.status === 'completed' ? 'success' : a.status === 'in_progress' ? 'accent' : 'default'}>{a.status}</Badge></td>
              <td>{a.completedItems}/{a.totalItems}</td>
              <td>{a.overallScore ?? '—'}</td>
              <td>{a.healthScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
