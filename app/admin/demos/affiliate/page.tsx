'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge, Button } from '@/components/ui';

interface RankingRow { affiliateId: string; name: string; status: string; conversionCount: number; fraudFlaggedCount: number; totalRevenueCents: number; totalCommissionCents: number; }
interface View {
  affiliateCount: number; linkCount: number; clickCount: number; conversionCount: number;
  fraudFlaggedCount: number; conversionRate: number | null; totalCommissionCents: number;
  ranking: RankingRow[]; gapsDisclosed: string;
}

export default function AffiliateDemoPage() {
  const [view, setView] = useState<View | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const load = () => fetch('/api/admin/affiliate/').then((r) => r.json()).then((d) => { setView(d); setLoading(false); });
  useEffect(() => { load(); }, []);

  const post = (payload: unknown) => fetch('/api/admin/affiliate/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }).then((r) => r.json());

  const runDemoWalkthrough = async () => {
    setSeeding(true);
    const suffix = Date.now();
    const recruit = await post({ action: 'recruit', name: `Demo Affiliate ${suffix}`, email: `demo-affiliate-${suffix}@example.com` });
    const link = await post({ action: 'create_link', affiliateId: recruit.id, destinationUrl: 'https://talentshill.com/demo' });
    const click = await post({ action: 'click', trackingCode: link.trackingCode });
    await new Promise((r) => setTimeout(r, 2100));
    await post({ action: 'convert', affiliateClickId: click.id, orderValueCents: 500000 });
    await load();
    setSeeding(false);
  };

  return (
    <div>
      <SectionHeader
        title="Demo 3 — Affiliate Revenue Control Tower"
        subtitle="Net-new real engine: recruit → tracking link → click → attributed conversion → deterministic commission → heuristic fraud check. No real payout-gateway integration exists (disclosed) — commission is computed and recorded, never marked paid."
      />
      <Button onClick={runDemoWalkthrough} disabled={seeding}>{seeding ? 'Running real walkthrough...' : 'Run a real end-to-end walkthrough'}</Button>
      {loading || !view ? <p style={{ marginTop: 16 }}>Loading...</p> : (
        <>
          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div><p style={{ fontSize: 13, color: '#888' }}>Affiliates</p><p style={{ fontSize: 24, fontWeight: 700 }}>{view.affiliateCount}</p></div>
                <div><p style={{ fontSize: 13, color: '#888' }}>Links</p><p style={{ fontSize: 24, fontWeight: 700 }}>{view.linkCount}</p></div>
                <div><p style={{ fontSize: 13, color: '#888' }}>Clicks</p><p style={{ fontSize: 24, fontWeight: 700 }}>{view.clickCount}</p></div>
                <div><p style={{ fontSize: 13, color: '#888' }}>Real conversions</p><p style={{ fontSize: 24, fontWeight: 700 }}>{view.conversionCount}</p></div>
                <div><p style={{ fontSize: 13, color: '#888' }}>Fraud-flagged</p><p style={{ fontSize: 24, fontWeight: 700 }}>{view.fraudFlaggedCount}</p></div>
                <div><p style={{ fontSize: 13, color: '#888' }}>Conversion rate</p><p style={{ fontSize: 24, fontWeight: 700 }}>{view.conversionRate === null ? 'no clicks yet' : `${view.conversionRate}%`}</p></div>
                <div><p style={{ fontSize: 13, color: '#888' }}>Commission owed</p><p style={{ fontSize: 24, fontWeight: 700 }}>${(view.totalCommissionCents / 100).toFixed(2)}</p></div>
              </div>
            </CardBody>
          </Card>

          <Card style={{ marginTop: 16 }}>
            <CardBody>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Affiliate ranking (real, revenue-ordered)</p>
              {view.ranking.length === 0 ? <p style={{ color: '#888' }}>No affiliates recruited yet.</p> : (
                <table style={{ width: '100%', fontSize: 14 }}>
                  <thead><tr><th style={{ textAlign: 'left' }}>Name</th><th>Status</th><th>Conversions</th><th>Fraud-flagged</th><th>Revenue</th><th>Commission</th></tr></thead>
                  <tbody>
                    {view.ranking.map((r) => (
                      <tr key={r.affiliateId}>
                        <td>{r.name}</td><td><Badge>{r.status}</Badge></td><td>{r.conversionCount}</td><td>{r.fraudFlaggedCount}</td>
                        <td>${(r.totalRevenueCents / 100).toFixed(2)}</td><td>${(r.totalCommissionCents / 100).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardBody>
          </Card>
          <p style={{ marginTop: 12, color: '#888', fontSize: 13 }}>{view.gapsDisclosed}</p>
        </>
      )}
    </div>
  );
}
