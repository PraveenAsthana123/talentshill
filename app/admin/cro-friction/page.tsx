'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Button, Input, Select, Badge } from '@/components/ui';

interface Finding {
  id: string;
  pageUrl: string;
  frictionType: string;
  severity: number;
  description: string;
  status: string;
}

export default function CroFrictionPage() {
  const [data, setData] = useState<{ totalFindings: number; openFindings: number; readinessScore: number; findings: Finding[] } | null>(null);
  const [pageUrl, setPageUrl] = useState('');
  const [frictionType, setFrictionType] = useState('confusing_cta');
  const [severity, setSeverity] = useState('3');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = () => fetch('/api/admin/cro-friction/').then((r) => r.json()).then(setData);
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setSubmitting(true);
    await fetch('/api/admin/cro-friction/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pageUrl, frictionType, severity: Number(severity), description }) });
    setPageUrl(''); setDescription('');
    await load();
    setSubmitting(false);
  };

  const fix = async (id: string) => {
    await fetch('/api/admin/cro-friction/', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    await load();
  };

  return (
    <div>
      <SectionHeader
        title="CRO / Website Friction Engine"
        subtitle="Real, admin-logged conversion-friction findings and a real readiness score (100 minus a weighted penalty per open finding). No automated site crawler/UX-analytics integration exists."
      />
      <Card>
        <CardBody>
          <p style={{ fontSize: 32, fontWeight: 700 }}>{data?.readinessScore ?? '...'}/100</p>
          <p>{data?.openFindings ?? 0} open findings of {data?.totalFindings ?? 0} total</p>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h3>Log a new finding</h3>
          <Input placeholder="Page URL" value={pageUrl} onChange={(e) => setPageUrl(e.target.value)} />
          <Select
            value={frictionType}
            onChange={(e) => setFrictionType(e.target.value)}
            options={[
              { value: 'slow_load', label: 'Slow load' },
              { value: 'confusing_cta', label: 'Confusing CTA' },
              { value: 'broken_form', label: 'Broken form' },
              { value: 'unclear_pricing', label: 'Unclear pricing' },
              { value: 'mobile_unusable', label: 'Mobile unusable' },
              { value: 'trust_signal_missing', label: 'Trust signal missing' },
              { value: 'other', label: 'Other' },
            ]}
          />
          <Select
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            options={[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `Severity ${n}` }))}
          />
          <Input placeholder="What did you actually observe?" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={submit} disabled={submitting || !pageUrl || !description}>{submitting ? 'Saving...' : 'Log Finding'}</Button>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ textAlign: 'left' }}>Page</th><th style={{ textAlign: 'left' }}>Type</th><th style={{ textAlign: 'left' }}>Severity</th><th style={{ textAlign: 'left' }}>Status</th><th /></tr></thead>
            <tbody>
              {data?.findings.map((f) => (
                <tr key={f.id}>
                  <td>{f.pageUrl}</td>
                  <td>{f.frictionType}</td>
                  <td>{f.severity}</td>
                  <td><Badge>{f.status}</Badge></td>
                  <td>{f.status === 'open' && <Button onClick={() => fix(f.id)}>Mark Fixed</Button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
