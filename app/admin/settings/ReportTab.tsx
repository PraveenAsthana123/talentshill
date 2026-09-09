'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './SettingsShared.module.css';

interface SettingRow { key: string; value: unknown; updatedBy: string | null; qualityScore: number | null }
interface ReportData { generatedAt: string; totalSettings: number; settings: SettingRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/settings/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Settings Report (by quality score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalSettings} total settings.</p>
      {data.settings.length === 0 && <p className={styles.empty}>No settings yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Key</th><th>Value</th><th>Edited by</th><th>Quality Score</th></tr></thead>
        <tbody>
          {data.settings.map((s, i) => (
            <tr key={i}>
              <td>{s.key}</td>
              <td>{String(s.value)}</td>
              <td><Badge variant={s.updatedBy ? 'success' : 'default'}>{s.updatedBy ? 'edited' : 'default'}</Badge></td>
              <td>{s.qualityScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
