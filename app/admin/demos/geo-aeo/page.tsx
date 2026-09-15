'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Data { totalObservations: number; mentionRate: number | null; byEngine: Record<string, { total: number; mentioned: number }>; }

export default function GeoAeoDemoPage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/geo-visibility/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader title="Demo — AEO/GEO: Optimize Brand for AI-Answer Engines" subtitle="Real, admin-observed AI-answer-engine (ChatGPT/Perplexity/Gemini/Copilot) mention tracking. No AI-search-engine API integration exists — every observation is a real, human-run query, logged honestly." />
      {!data ? <p>Loading...</p> : (
        <Card><CardBody>
          <p style={{ fontSize: 13, color: '#888' }}>Real observations logged</p>
          <p style={{ fontSize: 28, fontWeight: 700 }}>{data.totalObservations}</p>
          <p style={{ marginTop: 8 }}>Mention rate: <strong>{data.mentionRate === null ? 'no real observations yet' : `${data.mentionRate}%`}</strong></p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {Object.entries(data.byEngine).map(([engine, s]) => <Badge key={engine}>{engine}: {s.mentioned}/{s.total}</Badge>)}
          </div>
        </CardBody></Card>
      )}
    </div>
  );
}
