'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './RolesShared.module.css';

interface RoleRow { name: string; isSystem: boolean; permissionCount: number; hygieneScore: number | null }
interface ReportData { generatedAt: string; totalRoles: number; roles: RoleRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/roles/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Roles Report (by hygiene score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalRoles} total roles.</p>
      {data.roles.length === 0 && <p className={styles.empty}>No roles yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Type</th><th>Permissions</th><th>Hygiene Score</th></tr></thead>
        <tbody>
          {data.roles.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td><Badge variant={r.isSystem ? 'default' : 'accent'}>{r.isSystem ? 'system' : 'custom'}</Badge></td>
              <td>{r.permissionCount}</td>
              <td>{r.hygieneScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
