'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './AdminCompetitorAnalysis.module.css';

interface Entry {
  competitorName: string;
  competitorWebsite: string | null;
  offeringSummary: string | null;
  status: string;
}

interface ServiceBlock {
  service: { id: string; name: string; category: string };
  entries: Entry[];
}

interface ObservationRow { competitorName: string; observedAt: string; channel: string; campaignType: string; description: string }

interface ReportData {
  generatedAt: string;
  totalServices: number;
  servicesWithResearch: number;
  byService: ServiceBlock[];
  campaignObservations: ObservationRow[];
}

export default function ReportTab() {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    fetch('/api/admin/competitor-analysis/report/')
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, []);

  const handleGenerateShareLink = async () => {
    const res = await fetch('/api/admin/competitor-analysis/share-link/', { method: 'POST' });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Competitor Analysis Report</h4>
        <p>Generated {new Date(data.generatedAt).toLocaleString()} — {data.servicesWithResearch} of {data.totalServices} services have at least one real research entry.</p>
      </div>

      {data.byService.map((block) => (
        <div key={block.service.id} className={styles.subSection}>
          <h4>{block.service.name} <span style={{ fontWeight: 400, textTransform: 'none' }}>({block.service.category})</span></h4>
          {block.entries.length === 0 && <p className={styles.empty}>No competitor research recorded for this service yet.</p>}
          {block.entries.map((e) => (
            <div key={e.competitorName} className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
              <div className={styles.cardHeader}>
                <strong>{e.competitorName}</strong>
                <Badge variant={e.status === 'researched' ? 'success' : e.status === 'monitoring' ? 'accent' : 'warning'}>{e.status.replace('_', ' ')}</Badge>
              </div>
              {e.competitorWebsite && <div className={styles.field}><span>Website:</span> {e.competitorWebsite}</div>}
              {e.offeringSummary && <div className={styles.field}><span>Offering:</span> {e.offeringSummary}</div>}
            </div>
          ))}
        </div>
      ))}

      <div className={styles.subSection}>
        <h4>Campaign Observations (Competitor Campaign Monitor)</h4>
        {data.campaignObservations.length === 0 ? <p className={styles.empty}>No campaign observations logged yet.</p> : (
          <table className={styles.table}>
            <thead><tr><th>Competitor</th><th>Date</th><th>Channel</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
              {data.campaignObservations.map((o, i) => (
                <tr key={i}>
                  <td>{o.competitorName}</td><td>{new Date(o.observedAt).toLocaleDateString()}</td>
                  <td>{o.channel}</td><td>{o.campaignType}</td><td>{o.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className={styles.formActions} style={{ marginTop: 'var(--space-4)' }}><Button onClick={handleGenerateShareLink}>Generate Client Link</Button></div>
        {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}
      </div>
    </div>
  );
}
