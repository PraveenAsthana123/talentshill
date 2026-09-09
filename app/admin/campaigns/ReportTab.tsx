'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';
import styles from './CampaignsShared.module.css';

interface CampaignRow { name: string; type: string; status: string; subject: string | null; audienceCount: number; totalSent: number; totalOpened: number; totalClicked: number }
interface ReportData { generatedAt: string; totalCampaigns: number; campaigns: CampaignRow[] }

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/campaigns/report/').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }).then(setData).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div className={styles.subSection}>
      <h4>Campaign Report</h4>
      <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.totalCampaigns} total campaigns.</p>
      {data.campaigns.length === 0 && <p className={styles.empty}>No campaigns yet.</p>}
      <table className={styles.table}>
        <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Subject</th><th>Audience</th><th>Sent</th><th>Opened</th><th>Clicked</th></tr></thead>
        <tbody>
          {data.campaigns.map((c, i) => (
            <tr key={i}>
              <td>{c.name}</td><td>{c.type}</td>
              <td><Badge variant={c.status === 'completed' ? 'success' : 'default'}>{c.status}</Badge></td>
              <td>{c.subject || '—'}</td><td>{c.audienceCount}</td><td>{c.totalSent}</td><td>{c.totalOpened}</td><td>{c.totalClicked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
