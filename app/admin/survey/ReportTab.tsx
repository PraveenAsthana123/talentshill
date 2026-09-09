'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './SurveyShared.module.css';

interface ResponseRow { contactName: string | null; email: string | null; company: string | null; maturityLevel: string; totalScore: number; outreachPriority: number | null }
interface ReportData { generatedAt: string; totalResponses: number; responses: ResponseRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/survey/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Responses Report (by outreach priority)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalResponses} total responses.</p>
      {data.responses.length === 0 && <p className={styles.empty}>No responses yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Email</th><th>Company</th><th>Maturity</th><th>Score</th><th>Priority</th></tr></thead>
        <tbody>
          {data.responses.map((r, i) => (
            <tr key={i}>
              <td>{r.contactName || 'Anonymous'}</td><td>{r.email || '—'}</td><td>{r.company || '—'}</td>
              <td><Badge variant={r.maturityLevel === 'leader' ? 'success' : r.maturityLevel === 'advanced' ? 'accent' : 'default'}>{r.maturityLevel}</Badge></td>
              <td>{r.totalScore}</td><td>{r.outreachPriority ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
