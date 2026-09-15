'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Campaign { id: string; name: string; platform: string; status: string; spend: number | null; roas: number | null; cpa: number | null; }
interface Data { campaigns: Campaign[]; byPlatform: { platform: string; c: number }[]; gapsDisclosed: string; }

export default function PerformanceMarketingDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/demos/performance-marketing/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader title="Demo 2 — AI Budget Optimizer" subtitle="Real composition of the existing Ads Management module. ROAS/CPA computed live from real entered spend/revenue/conversions." />
      {!data ? <p>Loading...</p> : (
        <>
          <Card><CardBody>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{data.byPlatform.map((r) => <Badge key={r.platform}>{r.platform}: {r.c}</Badge>)}</div>
          </CardBody></Card>
          <Card style={{ marginTop: 16 }}><CardBody>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Real campaigns</p>
            <table style={{ width: '100%', fontSize: 14 }}>
              <thead><tr><th style={{ textAlign: 'left' }}>Campaign</th><th>Platform</th><th>Status</th><th>Spend</th><th>ROAS</th><th>CPA</th></tr></thead>
              <tbody>{data.campaigns.map((c) => (
                <tr key={c.id}><td>{c.name}</td><td>{c.platform}</td><td><Badge>{c.status}</Badge></td><td>{c.spend ? `$${c.spend.toFixed(2)}` : '—'}</td><td>{c.roas ?? 'no real revenue data yet'}</td><td>{c.cpa ?? 'no real conversion data yet'}</td></tr>
              ))}</tbody>
            </table>
          </CardBody></Card>
          <p style={{ marginTop: 12, color: '#888', fontSize: 13 }}>{data.gapsDisclosed}</p>
        </>
      )}
    </div>
  );
}
