'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface JourneyRow {
  submissionId: string;
  company: string;
  industry: string;
  projectStage: string;
  score: number | null;
  tier: string | null;
  qualificationStage: string | null;
  nextBestAction: { action: string; reason: string; computedAt: string } | null;
  researchDepth: string;
  alertSent: boolean;
  createdAt: string;
}

interface Data {
  journey: JourneyRow[];
  funnel: { totalLeads: number; byStage: Record<string, number> };
}

export default function LeadGenerationDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/demos/lead-generation/').then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  }, []);

  return (
    <div>
      <SectionHeader
        title="Demo 1 — AI Lead Capture and Qualification"
        subtitle="Real composition: intake → deterministic AI lead score → qualification stage → persisted next-best-action → research-depth gate. Every row below is a real submitted lead, not sample data."
      />
      {loading || !data ? <p>Loading...</p> : (
        <>
          <Card>
            <CardBody>
              <p style={{ fontSize: 13, color: '#888' }}>Total real leads</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{data.funnel.totalLeads}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {Object.entries(data.funnel.byStage).map(([stage, count]) => (
                  <Badge key={stage}>{stage}: {count}</Badge>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Most recent real lead journeys</p>
              <table style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Company</th>
                    <th style={{ textAlign: 'left' }}>Score</th>
                    <th style={{ textAlign: 'left' }}>Tier</th>
                    <th style={{ textAlign: 'left' }}>Stage</th>
                    <th style={{ textAlign: 'left' }}>Next-Best-Action</th>
                    <th style={{ textAlign: 'left' }}>Research depth</th>
                    <th style={{ textAlign: 'left' }}>Alert sent</th>
                  </tr>
                </thead>
                <tbody>
                  {data.journey.map((j) => (
                    <tr key={j.submissionId}>
                      <td>{j.company}</td>
                      <td>{j.score ?? '—'}</td>
                      <td><Badge>{j.tier ?? 'unscored'}</Badge></td>
                      <td>{j.qualificationStage}</td>
                      <td>{j.nextBestAction ? j.nextBestAction.action : 'not yet scored'}</td>
                      <td>{j.researchDepth}</td>
                      <td>{j.alertSent ? 'yes' : 'no'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
