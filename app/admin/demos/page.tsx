'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Demo {
  demoKey: string; name: string; flowSummary: string; valueStory: string;
  backingModuleKeys: string[]; readiness: 'ready' | 'partial' | 'not_started'; gapsDisclosed: string; lastVerifiedAt: string;
}

const READINESS_VARIANT: Record<string, 'success' | 'warning' | 'default'> = { ready: 'success', partial: 'warning', not_started: 'default' };

// demoKey -> page route slug. Most demoKeys match their route 1:1 with
// underscores swapped for hyphens, but affiliate_marketing and
// lifecycle_churn route to the shorter /affiliate and /lifecycle pages
// (named after the underlying net-new engine, not the demoKey).
const ROUTE_SLUG: Record<string, string> = {
  affiliate_marketing: 'affiliate',
  lifecycle_churn: 'lifecycle',
};
const routeFor = (demoKey: string) => ROUTE_SLUG[demoKey] ?? demoKey.replace(/_/g, '-');

export default function DemoShowcasePage() {
  const [demos, setDemos] = useState<Demo[] | null>(null);
  useEffect(() => { fetch('/api/admin/demos/').then((r) => r.json()).then((d) => setDemos(d.demos)); }, []);

  return (
    <div>
      <SectionHeader
        title="Client Demo Showcase"
        subtitle={`7 prioritized, real, client-facing demos — the source conversation's own "build 7, not 40" recommendation, not all 40 marketing-type use cases separately. Readiness is derived from live-verified backing modules, never hand-set.`}
      />
      {!demos ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16, marginTop: 16 }}>
          {demos.map((d) => (
            <Link key={d.demoKey} href={`/admin/demos/${routeFor(d.demoKey)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <Card hoverable>
                <CardBody>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <p style={{ fontWeight: 700, fontSize: 16 }}>{d.name}</p>
                    <Badge variant={READINESS_VARIANT[d.readiness]}>{d.readiness.replace('_', ' ')}</Badge>
                  </div>
                  <p style={{ fontSize: 13, color: '#888', marginTop: 8 }}>{d.flowSummary}</p>
                  <p style={{ fontSize: 13, marginTop: 8, fontStyle: 'italic' }}>&ldquo;{d.valueStory}&rdquo;</p>
                  <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
                    {d.backingModuleKeys.map((k) => <Badge key={k}>{k}</Badge>)}
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
