'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface ControlTowerView {
  kpis: { dimension: string; value: number | null; unit: string; confidence: string; sampleSize: number }[];
  readinessScore: number | null;
  readinessConfidence: string | null;
  topOpportunities: { dimension: string; rationale: string; recommendedModuleKey: string }[];
  sixMonthScenarios: { dimension: string; currentValue: number; months: number; projection: { month: number; conservative: number; moderate: number; aggressive: number }[] }[];
  evidenceRecordCount: number;
  dataSourcesConnected: number;
  dataSourcesTotal: number;
}

export default function ControlTowerDemoPage() {
  const [view, setView] = useState<ControlTowerView | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/demos/control-tower/').then((r) => r.json()).then((d) => { setView(d); setLoading(false); });
  }, []);

  return (
    <div>
      <SectionHeader
        title="Demo 7 — Marketing Intelligence Control Tower"
        subtitle="Real composition of the KPI Engine, Growth Readiness Score, Opportunity Engine and Growth Scenario Simulator — no new data source, no LLM call. This is what a client sees once their real data sources are connected."
      />
      {loading || !view ? <p>Loading...</p> : (
        <>
          <Card>
            <CardBody>
              <p style={{ fontSize: 13, color: '#888' }}>Real data sources connected</p>
              <p style={{ fontSize: 28, fontWeight: 700 }}>{view.dataSourcesConnected} / {view.dataSourcesTotal} KPI dimensions</p>
              <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>Backed by {view.evidenceRecordCount} real, traceable evidence records</p>
            </CardBody>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <p style={{ fontSize: 13, color: '#888' }}>Growth Readiness Score</p>
              <p style={{ fontSize: 32, fontWeight: 700 }}>{view.readinessScore === null ? 'No real data yet' : `${view.readinessScore}/100`}</p>
              {view.readinessConfidence && <Badge>{view.readinessConfidence} confidence</Badge>}
            </CardBody>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>KPI Snapshot (real, per-dimension)</p>
              <table style={{ width: '100%', fontSize: 14 }}>
                <thead><tr><th style={{ textAlign: 'left' }}>Dimension</th><th style={{ textAlign: 'left' }}>Value</th><th style={{ textAlign: 'left' }}>Confidence</th><th style={{ textAlign: 'left' }}>Sample</th></tr></thead>
                <tbody>
                  {view.kpis.map((k) => (
                    <tr key={k.dimension}>
                      <td>{k.dimension}</td>
                      <td>{k.value === null ? 'no real data yet' : `${k.value}${k.unit === 'percent' ? '%' : ''}`}</td>
                      <td><Badge>{k.confidence}</Badge></td>
                      <td>{k.sampleSize}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardBody>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Top real opportunities (ranked)</p>
              {view.topOpportunities.length === 0 ? <p style={{ color: '#888' }}>No opportunities computed yet — run the Opportunity Engine's recompute.</p> : (
                <ul>
                  {view.topOpportunities.map((o) => (
                    <li key={o.dimension} style={{ marginBottom: 8 }}>
                      <strong>{o.dimension}</strong>: {o.rationale} <Badge>{o.recommendedModuleKey}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>6-month growth scenarios (from real current values)</p>
              {view.sixMonthScenarios.length === 0 ? <p style={{ color: '#888' }}>No real KPI values to project from yet.</p> : (
                <table style={{ width: '100%', fontSize: 14 }}>
                  <thead><tr><th style={{ textAlign: 'left' }}>Dimension</th><th>Now</th><th>Conservative (2%)</th><th>Moderate (5%)</th><th>Aggressive (10%)</th></tr></thead>
                  <tbody>
                    {view.sixMonthScenarios.map((s) => {
                      const last = s.projection[s.projection.length - 1];
                      return (
                        <tr key={s.dimension}>
                          <td>{s.dimension}</td>
                          <td>{s.currentValue}</td>
                          <td>{last.conservative}</td>
                          <td>{last.moderate}</td>
                          <td>{last.aggressive}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
