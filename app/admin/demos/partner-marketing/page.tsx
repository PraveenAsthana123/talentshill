'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Partner { id: string; partnerName: string; partnerType: string; relationshipStatus: string; }
interface Data { partners: Partner[]; summary: { total: number; byStatus: Record<string, number> }; }

export default function PartnerMarketingDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/partners/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader title="Demo — Partner Marketing: B2B Partner Pipeline" subtitle="Real, admin-entered B2B co-marketing/partner tracking. No partner-portal/CRM-sync integration exists." />
      {!data ? <p>Loading...</p> : (
        <>
          <Card><CardBody>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{data.summary.total} real partners</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{Object.entries(data.summary.byStatus).map(([s, c]) => <Badge key={s}>{s}: {c}</Badge>)}</div>
          </CardBody></Card>
          <Card style={{ marginTop: 16 }}><CardBody>
            <table style={{ width: '100%', fontSize: 14 }}>
              <thead><tr><th style={{ textAlign: 'left' }}>Partner</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>{data.partners.map((p) => (<tr key={p.id}><td>{p.partnerName}</td><td>{p.partnerType}</td><td><Badge>{p.relationshipStatus}</Badge></td></tr>))}</tbody>
            </table>
          </CardBody></Card>
        </>
      )}
    </div>
  );
}
