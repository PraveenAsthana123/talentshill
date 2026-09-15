'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Button, Badge } from '@/components/ui';

interface Snapshot {
  id: string;
  dimension: string;
  value: number | null;
  sampleSize: number;
  confidence: string;
  unit: string;
  computedAt: string;
}

const DIMENSION_LABELS: Record<string, string> = {
  lead_generation: 'Lead Generation',
  lead_quality: 'Lead Quality',
  email_engagement: 'Email Engagement (open rate)',
  webinar_engagement: 'Webinar Engagement (attendance rate)',
  ad_efficiency: 'Ad Efficiency (conversion rate)',
  operational_health: 'Operational Health (pipeline success rate)',
};

export default function KpiEnginePage() {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const load = () => fetch('/api/admin/kpi-engine/').then((r) => r.json()).then((d) => { setSnapshots(d.snapshots || []); setLoading(false); });

  useEffect(() => { load(); }, []);

  const recompute = async () => {
    setRecomputing(true);
    await fetch('/api/admin/kpi-engine/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ days: 30 }) });
    await load();
    setRecomputing(false);
  };

  return (
    <div>
      <SectionHeader
        title="KPI Engine"
        subtitle="Real, explainable KPI dimensions computed from real contact_submissions/campaign_recipients/webinar_registrants/ad_campaign_metrics/operation_run data, each with a real sample size and confidence -- a dimension with zero real samples shows as no data, never a fabricated 0%."
      />
      <Card>
        <CardBody>
          <Button onClick={recompute} disabled={recomputing}>{recomputing ? 'Recomputing...' : 'Recompute (trailing 30 days)'}</Button>
          {loading ? <p style={{ marginTop: 16 }}>Loading...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 6 }}>Dimension</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Value</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Sample Size</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Confidence</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Computed</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr key={s.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: 6 }}>{DIMENSION_LABELS[s.dimension] ?? s.dimension}</td>
                    <td style={{ padding: 6 }}>{s.value === null ? 'No real data yet' : `${s.value}${s.unit === 'percent' ? '%' : ''}`}</td>
                    <td style={{ padding: 6 }}>{s.sampleSize}</td>
                    <td style={{ padding: 6 }}><Badge>{s.confidence}</Badge></td>
                    <td style={{ padding: 6 }}>{new Date(s.computedAt).toLocaleString()}</td>
                  </tr>
                ))}
                {snapshots.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 12, color: '#888' }}>No snapshots yet -- click Recompute.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
