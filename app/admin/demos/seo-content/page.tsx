'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Data { contentByStatus: { status: string; c: number }[]; topicsByStatus: { status: string; c: number }[]; competitorCount: number; ragDocCount: number; gapsDisclosed: string; }

export default function SeoContentDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/demos/seo-content/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader title="Demo 4 — SEO + Content AI Factory" subtitle="Real composition of Content Management, Competitor Analysis, and the RAG Pipeline (content drafting assistance)." />
      {!data ? <p>Loading...</p> : (
        <>
          <Card><CardBody>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Content by status</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{data.contentByStatus.map((r) => <Badge key={r.status}>{r.status}: {r.c}</Badge>)}</div>
          </CardBody></Card>
          <Card style={{ marginTop: 16 }}><CardBody>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Content topics (editorial calendar) by status</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{data.topicsByStatus.map((r) => <Badge key={r.status}>{r.status}: {r.c}</Badge>)}</div>
          </CardBody></Card>
          <Card style={{ marginTop: 16 }}><CardBody>
            <p><strong>{data.competitorCount}</strong> real competitor profiles tracked. <strong>{data.ragDocCount}</strong> real documents ingested into the RAG Pipeline.</p>
          </CardBody></Card>
          <p style={{ marginTop: 12, color: '#888', fontSize: 13 }}>{data.gapsDisclosed}</p>
        </>
      )}
    </div>
  );
}
