'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Campaign { id: string; influencerName: string; platform: string; status: string; audienceFitScore: number | null; agreedFee: number | null; }
interface Data { campaigns: Campaign[]; byStatus: { status: string; c: number }[]; avgAudienceFit: number | null; gapsDisclosed: string; }

export default function SocialInfluencerDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/demos/social-influencer/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader title="Demo 5 — Creator Discovery and Campaign ROI" subtitle="Real composition of the existing Influencer Video module." />
      {!data ? <p>Loading...</p> : (
        <>
          <Card><CardBody>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{data.byStatus.map((r) => <Badge key={r.status}>{r.status}: {r.c}</Badge>)}</div>
            <p style={{ marginTop: 8 }}>Average real audience-fit score: <strong>{data.avgAudienceFit ?? 'no real data yet'}</strong></p>
          </CardBody></Card>
          <Card style={{ marginTop: 16 }}><CardBody>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Real creator campaigns</p>
            <table style={{ width: '100%', fontSize: 14 }}>
              <thead><tr><th style={{ textAlign: 'left' }}>Creator</th><th>Platform</th><th>Status</th><th>Audience fit</th><th>Fee</th></tr></thead>
              <tbody>{data.campaigns.map((c) => (
                <tr key={c.id}><td>{c.influencerName}</td><td>{c.platform}</td><td><Badge>{c.status}</Badge></td><td>{c.audienceFitScore ?? '—'}</td><td>{c.agreedFee ? `$${c.agreedFee.toFixed(2)}` : '—'}</td></tr>
              ))}</tbody>
            </table>
          </CardBody></Card>
          <p style={{ marginTop: 12, color: '#888', fontSize: 13 }}>{data.gapsDisclosed}</p>
        </>
      )}
    </div>
  );
}
