'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Button, Badge } from '@/components/ui';

interface Candidate {
  id: string;
  dimension: string;
  gapType: string;
  rankScore: number;
  recommendedModuleKey: string;
  rationale: string;
  computedAt: string;
}

export default function OpportunitiesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const load = () => fetch('/api/admin/opportunities/').then((r) => r.json()).then((d) => { setCandidates(d.candidates || []); setLoading(false); });
  useEffect(() => { load(); }, []);

  const recompute = async () => {
    setRecomputing(true);
    await fetch('/api/admin/opportunities/', { method: 'POST' });
    await load();
    setRecomputing(false);
  };

  return (
    <div>
      <SectionHeader
        title="Opportunity & Benchmark Engine"
        subtitle="Real gaps ranked by impact x feasibility x confidence from the real KPI Engine, each pointing at a real existing module to fix it. Thresholds/weights are disclosed, hardcoded business judgment -- not derived data."
      />
      <Card>
        <CardBody>
          <Button onClick={recompute} disabled={recomputing}>{recomputing ? 'Ranking...' : 'Re-rank from latest KPI data'}</Button>
          {loading ? <p style={{ marginTop: 16 }}>Loading...</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 6 }}>Dimension</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Gap Type</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Rank</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Recommended Module</th>
                  <th style={{ textAlign: 'left', padding: 6 }}>Rationale</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => (
                  <tr key={c.id} style={{ borderTop: '1px solid #eee' }}>
                    <td style={{ padding: 6 }}>{c.dimension}</td>
                    <td style={{ padding: 6 }}><Badge>{c.gapType}</Badge></td>
                    <td style={{ padding: 6 }}>{c.rankScore}</td>
                    <td style={{ padding: 6 }}>{c.recommendedModuleKey}</td>
                    <td style={{ padding: 6, fontSize: 13 }}>{c.rationale}</td>
                  </tr>
                ))}
                {candidates.length === 0 && (
                  <tr><td colSpan={5} style={{ padding: 12, color: '#888' }}>No opportunities yet -- click Re-rank (run KPI Engine's Recompute first for fresh data).</td></tr>
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
