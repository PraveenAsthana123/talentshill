'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Button, Badge } from '@/components/ui';

interface Snapshot {
  id: string;
  score: number | null;
  dimensionsIncluded: number;
  dimensionsExcluded: number;
  confidence: string;
  computedAt: string;
}

export default function GrowthReadinessPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const load = () => fetch('/api/admin/growth-readiness/').then((r) => r.json()).then((d) => { setSnapshot(d.snapshot); setLoading(false); });
  useEffect(() => { load(); }, []);

  const recompute = async () => {
    setRecomputing(true);
    await fetch('/api/admin/growth-readiness/', { method: 'POST' });
    await load();
    setRecomputing(false);
  };

  return (
    <div>
      <SectionHeader
        title="Growth Readiness Score"
        subtitle="Company-wide confidence-weighted composite across all real KPI Engine dimensions. A dimension with no real data is excluded from the average, not treated as 0."
      />
      <Card>
        <CardBody>
          <Button onClick={recompute} disabled={recomputing}>{recomputing ? 'Recomputing...' : 'Recompute from latest KPIs'}</Button>
          {loading ? <p style={{ marginTop: 16 }}>Loading...</p> : snapshot ? (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 32, fontWeight: 700 }}>{snapshot.score === null ? 'No real data yet' : `${snapshot.score}/100`}</p>
              <p>
                <Badge>{snapshot.confidence}</Badge> confidence &mdash; {snapshot.dimensionsIncluded} of {snapshot.dimensionsIncluded + snapshot.dimensionsExcluded} real KPI dimensions included
              </p>
              <p style={{ color: '#888', fontSize: 13 }}>Computed {new Date(snapshot.computedAt).toLocaleString()}</p>
            </div>
          ) : (
            <p style={{ marginTop: 16, color: '#888' }}>No snapshot yet -- click Recompute (run KPI Engine's Recompute first for fresh underlying data).</p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
