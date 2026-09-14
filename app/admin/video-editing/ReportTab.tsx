'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './VideoEditingShared.module.css';

interface ProjectRow { title: string; tool: string; status: string; durationSeconds: number | null; readinessScore: number | null }
interface ClipRow { title: string; sourceTitle: string; targetPlatform: string; targetAspectRatio: string; status: string; durationSeconds: number; readinessScore: number | null }
interface ReportData { generatedAt: string; totalProjects: number; projects: ProjectRow[]; clipPlans: ClipRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/video-editing/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/video-editing/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

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

      <h4 style={{ marginTop: 'var(--space-5)' }}>Clip Plan Report (Video Repurposing Factory)</h4>
      {data.clipPlans.length === 0 ? <p className={styles.empty}>No clip plans yet.</p> : (
        <table className={styles.table}>
          <thead><tr><th>Clip</th><th>Source</th><th>Platform</th><th>Aspect</th><th>Status</th><th>Duration (s)</th><th>Readiness</th></tr></thead>
          <tbody>
            {data.clipPlans.map((c, i) => (
              <tr key={i}>
                <td>{c.title}</td><td>{c.sourceTitle}</td><td>{c.targetPlatform}</td><td>{c.targetAspectRatio}</td>
                <td><Badge variant={c.status === 'delivered' ? 'success' : 'default'}>{c.status}</Badge></td>
                <td>{c.durationSeconds}</td><td>{c.readinessScore ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
      {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
    </div>
  );
}
