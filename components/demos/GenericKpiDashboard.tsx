'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Source { label: string; apiPath: string; }
interface KpiSet { label: string; kpis: Record<string, unknown>; byBucket?: Record<string, number> | null; }

// Reusable, generic real-data dashboard for the demo-catalog items that
// already have a real, live `kpis: {...}` dashboard endpoint (10-tab
// standard modules) -- renders whatever real KPI fields that endpoint
// returns, rather than hardcoding field names per module (safer across
// many modules with slightly different KPI shapes, still 100% real data,
// no fabricated fields).
export default function GenericKpiDashboard({ title, subtitle, sources }: { title: string; subtitle: string; sources: Source[] }) {
  const [sets, setSets] = useState<KpiSet[] | null>(null);

  useEffect(() => {
    Promise.all(sources.map((s) => fetch(s.apiPath).then((r) => r.json()).then((d) => ({
      label: s.label,
      kpis: d.kpis ?? {},
      byBucket: d.byCategory ?? d.byRequestStatus ?? d.byType ?? d.byQualificationTier ?? d.byCallTier ?? null,
    })))).then(setSets);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} />
      {!sets ? <p>Loading...</p> : sets.map((set) => (
        <Card key={set.label} style={{ marginTop: 16 }}>
          <CardBody>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>{set.label} (real, live)</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {Object.entries(set.kpis).map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize: 12, color: '#888' }}>{k}</p>
                  <p style={{ fontSize: 18, fontWeight: 700 }}>{v === null || v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v)}</p>
                </div>
              ))}
            </div>
            {set.byBucket && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {Object.entries(set.byBucket).map(([k, v]) => <Badge key={k}>{k}: {v}</Badge>)}
              </div>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
