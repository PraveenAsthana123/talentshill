'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './BannersShared.module.css';

interface BannerRow { title: string; placement: string; isActive: boolean; healthScore: number | null }
interface ReportData { generatedAt: string; totalBanners: number; banners: BannerRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/banners/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Banners Report (by health score)</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalBanners} total banners.</p>
      {data.banners.length === 0 && <p className={styles.empty}>No banners yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Title</th><th>Placement</th><th>Status</th><th>Health</th></tr></thead>
        <tbody>
          {data.banners.map((b, i) => (
            <tr key={i}>
              <td>{b.title}</td><td>{b.placement}</td>
              <td><Badge variant={b.isActive ? 'success' : 'default'}>{b.isActive ? 'active' : 'inactive'}</Badge></td>
              <td>{b.healthScore ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
