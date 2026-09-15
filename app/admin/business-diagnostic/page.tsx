'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody } from '@/components/ui';

interface DemandEntry { key: string; count: number; }
interface Transition { fromStage: string; toStage: string; fromCount: number; toCount: number; conversionRate: number | null; }

export default function BusinessDiagnosticPage() {
  const [demandMap, setDemandMap] = useState<{ byIndustry: DemandEntry[]; byInterestArea: DemandEntry[]; totalSubmissions: number } | null>(null);
  const [funnel, setFunnel] = useState<{ transitions: Transition[]; constraint: Transition | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/business-diagnostic/').then((r) => r.json()).then((d) => {
      setDemandMap(d.demandMap);
      setFunnel(d.funnelConstraint);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <SectionHeader
        title="Business Diagnostic"
        subtitle="Real Demand Map (which real industries/interest areas generate the most leads) and Funnel Constraint (the real weakest stage-to-stage conversion) -- both computed live from real contact_submissions, never fabricated."
      />
      {loading ? <p>Loading...</p> : (
        <>
          <Card>
            <CardBody>
              <h3>Demand Map ({demandMap?.totalSubmissions ?? 0} real submissions)</h3>
              <strong>By Industry</strong>
              <ul>{demandMap?.byIndustry.slice(0, 8).map((e) => <li key={e.key}>{e.key}: {e.count}</li>)}</ul>
              <strong>By Interest Area</strong>
              <ul>{demandMap?.byInterestArea.slice(0, 8).map((e) => <li key={e.key}>{e.key}: {e.count}</li>)}</ul>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3>Funnel Constraint</h3>
              <p style={{ fontSize: 13, color: '#888' }}>Assumes qualificationStage reflects cumulative progress (a lead at "sql" also passed "mql") -- this app does not log stage-transition history separately.</p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={{ textAlign: 'left' }}>Transition</th><th style={{ textAlign: 'left' }}>Rate</th></tr></thead>
                <tbody>
                  {funnel?.transitions.map((t) => (
                    <tr key={`${t.fromStage}-${t.toStage}`} style={{ background: funnel.constraint === t ? '#fee' : undefined }}>
                      <td>{t.fromStage} &rarr; {t.toStage} ({t.toCount}/{t.fromCount})</td>
                      <td>{t.conversionRate === null ? 'no data' : `${t.conversionRate}%`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {funnel?.constraint && <p><strong>Weakest link:</strong> {funnel.constraint.fromStage} &rarr; {funnel.constraint.toStage} ({funnel.constraint.conversionRate}%)</p>}
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
