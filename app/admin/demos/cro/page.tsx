'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Finding { id: string; pageUrl: string; frictionType: string; severity: number; status: string; description: string; }
interface Data { totalFindings: number; openFindings: number; fixedFindings: number; readinessScore: number; findings: Finding[]; }

export default function CroDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/cro-friction/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader title="Demo — CRO: AI Landing-Page Optimization" subtitle="Real, admin-logged conversion-friction findings with a disclosed readiness-score formula. No automated site crawler/UX-analytics integration exists." />
      {!data ? <p>Loading...</p> : (
        <>
          <Card><CardBody>
            <p style={{ fontSize: 13, color: '#888' }}>Conversion readiness score</p>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{data.readinessScore}/100</p>
            <p style={{ marginTop: 8 }}>{data.openFindings} open, {data.fixedFindings} fixed, {data.totalFindings} total real findings.</p>
          </CardBody></Card>
          <Card style={{ marginTop: 16 }}><CardBody>
            <table style={{ width: '100%', fontSize: 14 }}>
              <thead><tr><th style={{ textAlign: 'left' }}>Page</th><th>Type</th><th>Severity</th><th>Status</th></tr></thead>
              <tbody>{data.findings.map((f) => (<tr key={f.id}><td>{f.pageUrl}</td><td>{f.frictionType}</td><td>{f.severity}</td><td><Badge>{f.status}</Badge></td></tr>))}</tbody>
            </table>
          </CardBody></Card>
        </>
      )}
    </div>
  );
}
