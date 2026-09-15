'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge, Button } from '@/components/ui';

interface LifecycleRow { id: string; contactEmail: string; stage: string; churnRisk: string; daysSinceLastActivity: number | null; }
interface Data { totalContacts: number; byStage: Record<string, number>; atRiskOrChurned: LifecycleRow[]; gapsDisclosed: string; rows: LifecycleRow[]; }

export default function LifecycleDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const load = () => fetch('/api/admin/lifecycle/').then((r) => r.json()).then((d) => { setData(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const recompute = async () => {
    setRecomputing(true);
    await fetch('/api/admin/lifecycle/', { method: 'POST' });
    await load();
    setRecomputing(false);
  };

  return (
    <div>
      <SectionHeader
        title="Demo 6 — Lifecycle / Churn AI"
        subtitle="Net-new, deterministic stage + churn-risk classification from real contact recency — no LLM call, no fabricated propensity model."
      />
      <Button onClick={recompute} disabled={recomputing}>{recomputing ? 'Recomputing...' : 'Recompute from real contacts'}</Button>
      {loading || !data ? <p style={{ marginTop: 16 }}>Loading...</p> : (
        <>
          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <p style={{ fontSize: 13, color: '#888' }}>Total real contacts classified</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{data.totalContacts}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {Object.entries(data.byStage).map(([stage, count]) => (
                  <Badge key={stage}>{stage}: {count}</Badge>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>At-risk / churned (real, sorted by longest inactivity)</p>
              {data.atRiskOrChurned.length === 0 ? <p style={{ color: '#888' }}>None yet — click Recompute.</p> : (
                <table style={{ width: '100%', fontSize: 14 }}>
                  <thead><tr><th style={{ textAlign: 'left' }}>Contact</th><th>Stage</th><th>Churn risk</th><th>Days inactive</th></tr></thead>
                  <tbody>
                    {data.atRiskOrChurned.map((r) => (
                      <tr key={r.id}><td>{r.contactEmail}</td><td><Badge>{r.stage}</Badge></td><td><Badge>{r.churnRisk}</Badge></td><td>{r.daysSinceLastActivity}</td></tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
          <p style={{ marginTop: 12, color: '#888', fontSize: 13 }}>{data.gapsDisclosed}</p>
        </>
      )}
    </div>
  );
}
