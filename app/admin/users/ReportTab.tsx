'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './UsersShared.module.css';

interface UserRow { name: string; email: string; isActive: boolean; securityScore: number | null; roles: string[] }
interface ReportData { generatedAt: string; totalUsers: number; users: UserRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Users Report (by security score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalUsers} total users.</p>
      {data.users.length === 0 && <p className={styles.empty}>No users yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th>Security Score</th></tr></thead>
        <tbody>
          {data.users.map((u, i) => (
            <tr key={i}>
              <td>{u.name}</td><td>{u.email}</td><td>{u.roles.join(', ') || '—'}</td>
              <td><Badge variant={u.isActive ? 'success' : 'default'}>{u.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{u.securityScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
