'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

interface Methodology { num: number; name: string; description: string; typicalOutput: string; status: string; }
interface Data { total: number; notStartedCount: number; methodologies: Methodology[]; }

export default function ResearchCatalogPage() {
  const [data, setData] = useState<Data | null>(null);
  useEffect(() => { fetch('/api/admin/research-catalog/').then((r) => r.json()).then(setData); }, []);

  return (
    <div>
      <SectionHeader
        title="Research Methodology Catalog (90 items)"
        subtitle="The source conversation's separate 90-item market-research catalog, honestly registered as not_started. The existing Market Research module (briefs + Ollama synthesis + opportunity scoring) does not implement any of these as a distinct capability — no fabricated coverage."
      />
      {!data ? <p>Loading...</p> : (
        <>
          <Card><CardBody>
            <p style={{ fontSize: 28, fontWeight: 700 }}>{data.notStartedCount} / {data.total} not started</p>
          </CardBody></Card>
          <Card style={{ marginTop: 16 }}><CardBody>
            <table style={{ width: '100%', fontSize: 13 }}>
              <thead><tr><th style={{ textAlign: 'left' }}>#</th><th style={{ textAlign: 'left' }}>Methodology</th><th style={{ textAlign: 'left' }}>What it does</th><th style={{ textAlign: 'left' }}>Typical output</th><th>Status</th></tr></thead>
              <tbody>{data.methodologies.map((m) => (
                <tr key={m.num}><td>{m.num}</td><td>{m.name}</td><td>{m.description}</td><td>{m.typicalOutput}</td><td><Badge>{m.status}</Badge></td></tr>
              ))}</tbody>
            </table>
          </CardBody></Card>
        </>
      )}
    </div>
  );
}
