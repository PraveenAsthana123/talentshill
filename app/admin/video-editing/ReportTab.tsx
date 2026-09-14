'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './VideoEditingShared.module.css';

interface ProjectRow { title: string; tool: string; status: string; durationSeconds: number | null; readinessScore: number | null }
interface ReportData { generatedAt: string; totalProjects: number; projects: ProjectRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/video-editing/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Project Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalProjects} total projects.</p>
      {data.projects.length === 0 && <p className={styles.empty}>No projects yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Tool</th><th>Status</th><th>Duration (s)</th><th>Readiness</th></tr></thead>
        <tbody>
          {data.projects.map((p, i) => (
            <tr key={i}>
              <td>{p.title}</td><td>{p.tool}</td>
              <td><Badge variant={p.status === 'published' ? 'success' : 'default'}>{p.status}</Badge></td>
              <td>{p.durationSeconds ?? '—'}</td><td>{p.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
