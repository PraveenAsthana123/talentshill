'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './TemplatesShared.module.css';

interface TemplateRow { name: string; category: string | null; isActive: boolean; readinessScore: number | null }
interface ReportData { generatedAt: string; totalTemplates: number; templates: TemplateRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/templates/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Templates Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalTemplates} total templates.</p>
      {data.templates.length === 0 && <p className={styles.empty}>No templates yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.templates.map((t, i) => (
            <tr key={i}>
              <td>{t.name}</td><td>{t.category || '—'}</td>
              <td><Badge variant={t.isActive ? 'success' : 'default'}>{t.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{t.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
