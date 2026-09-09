'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './ListsShared.module.css';

interface ListRow { name: string; type: string; memberCount: number; lastSyncedAt: string | null }
interface ReportData { generatedAt: string; totalLists: number; lists: ListRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/lists/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Lists Report (most recently updated first)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalLists} total lists.</p>
      {data.lists.length === 0 && <p className={styles.empty}>No lists yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Type</th><th>Members</th><th>Last Synced</th></tr></thead>
        <tbody>
          {data.lists.map((l, i) => (
            <tr key={i}>
              <td>{l.name}</td>
              <td><Badge variant={l.type === 'dynamic' ? 'accent' : 'default'}>{l.type}</Badge></td>
              <td>{l.memberCount}</td>
              <td>{l.lastSyncedAt ? new Date(l.lastSyncedAt).toLocaleString() : (l.type === 'dynamic' ? 'Never' : 'N/A')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
