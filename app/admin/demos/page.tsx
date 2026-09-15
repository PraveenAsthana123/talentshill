'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Demo {
  demoKey: string; sourceNum: number | null; pageRoute: string | null; name: string; flowSummary: string; valueStory: string;
  backingModuleKeys: string[]; readiness: 'ready' | 'partial' | 'not_started'; gapsDisclosed: string; lastVerifiedAt: string;
}
interface Data { total: number; readyCount: number; partialCount: number; notStartedCount: number; demos: Demo[]; }

const READINESS_VARIANT: Record<string, 'success' | 'warning' | 'default'> = { ready: 'success', partial: 'warning', not_started: 'default' };

function DemoCard({ d }: { d: Demo }) {
  const body = (
    <Card hoverable={!!d.pageRoute}>
      <CardBody>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
          <p style={{ fontWeight: 700, fontSize: 16 }}>{d.sourceNum ? `#${d.sourceNum} ` : ''}{d.name}</p>
          <Badge variant={READINESS_VARIANT[d.readiness]}>{d.readiness.replace('_', ' ')}</Badge>
        </div>
        <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>{d.flowSummary}</p>
        <p style={{ fontSize: 13, marginTop: 8, fontStyle: 'italic' }}>&ldquo;{d.valueStory}&rdquo;</p>
        <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
          {d.backingModuleKeys.length > 0 ? d.backingModuleKeys.map((k) => <Badge key={k}>{k}</Badge>) : <Badge variant="default">no backing module</Badge>}
        </div>
        <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>{d.gapsDisclosed}</p>
      </CardBody>
    </Card>
  );
  return d.pageRoute ? <Link href={d.pageRoute} style={{ textDecoration: 'none', color: 'inherit' }}>{body}</Link> : <div>{body}</div>;
}

export default function DemoShowcasePage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/demos/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader
        title="Client Demo Showcase — Full 40-Item Catalog"
        subtitle="Every marketing-type use case from the source catalog, honestly registered. Cards you can click have a real, live-verified backing module; cards you can't are genuinely not started — not silently omitted. See also the separate Research Methodology Catalog (90 items, all not started)."
      />
      {!data ? <p>Loading...</p> : (
        <>
          <Card style={{ marginTop: 16 }}><CardBody>
            <div style={{ display: 'flex', gap: 24 }}>
              <div><p style={{ fontSize: 12, color: '#888' }}>Ready</p><p style={{ fontSize: 24, fontWeight: 700 }}>{data.readyCount}</p></div>
              <div><p style={{ fontSize: 12, color: '#888' }}>Partial</p><p style={{ fontSize: 24, fontWeight: 700 }}>{data.partialCount}</p></div>
              <div><p style={{ fontSize: 12, color: '#888' }}>Not started</p><p style={{ fontSize: 24, fontWeight: 700 }}>{data.notStartedCount}</p></div>
              <div><p style={{ fontSize: 12, color: '#888' }}>Total</p><p style={{ fontSize: 24, fontWeight: 700 }}>{data.total}</p></div>
            </div>
          </CardBody></Card>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 16 }}>
            {data.demos.map((d) => <DemoCard key={d.demoKey} d={d} />)}
          </div>
        </>
      )}
    </div>
  );
}
