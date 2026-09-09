'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './ProfilesShared.module.css';

interface ProfileRow { name: string; fromEmail: string; isActive: boolean; isDefault: boolean; readinessScore: number | null }
interface ReportData { generatedAt: string; totalProfiles: number; profiles: ProfileRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/email-profiles/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Email Profiles Report (by readiness score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalProfiles} total profiles.</p>
      {data.profiles.length === 0 && <p className={styles.empty}>No profiles yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>From</th><th>Default</th><th>Status</th><th>Readiness Score</th></tr></thead>
        <tbody>
          {data.profiles.map((p, i) => (
            <tr key={i}>
              <td>{p.name}</td><td>{p.fromEmail}</td>
              <td>{p.isDefault ? 'Yes' : '—'}</td>
              <td><Badge variant={p.isActive ? 'success' : 'default'}>{p.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{p.readinessScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
