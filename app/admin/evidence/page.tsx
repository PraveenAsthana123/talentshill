'use client';

import { useEffect, useState } from 'react';
import { SectionHeader, Card, CardBody, Badge } from '@/components/ui';

// Cross-cutting infrastructure layer (gap-analysis backlog #1/25), not a
// primary business-process module -- deliberately a lean single page
// rather than the full Operational Portal 10-tab standard used by
// primary modules (competitor-analysis, occasions, module-registry).
// Disclosed scope decision, see module_registry.missingItems.
interface EvidenceRow {
  id: string;
  moduleKey: string;
  claimClass: string;
  claimText: string;
  sourceRef: string;
  confidence: string | null;
  observedAt: string;
}

interface Summary {
  total: number;
  totalByClass: Record<string, number>;
  staleCount: number;
}

export default function EvidenceLedgerPage() {
  const [rows, setRows] = useState<EvidenceRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    const qs = moduleFilter ? `?moduleKey=${encodeURIComponent(moduleFilter)}` : '';
    Promise.all([
      fetch(`/api/admin/evidence${qs}`).then((r) => r.json()),
      fetch(`/api/admin/evidence?summary=true${moduleFilter ? `&moduleKey=${encodeURIComponent(moduleFilter)}` : ''}`).then((r) => r.json()),
    ]).then(([list, sum]) => {
      setRows(list.entries || []);
      setSummary(sum);
      setLoading(false);
    });
  }, [moduleFilter]);

  return (
    <div>
      <SectionHeader
        title="Evidence Ledger"
        subtitle="Real claim classification (FACT/ESTIMATE/INFERENCE/HYPOTHESIS/UNKNOWN) with mandatory source traceability. Every row here is produced by a real pipeline computation or a real admin entry -- never fabricated."
      />
      <Card>
        <CardBody>
          <input
            placeholder="Filter by module key (e.g. leads)"
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            style={{ marginBottom: 16, padding: 8, width: 280 }}
          />
          {loading ? <p>Loading...</p> : (
            <>
              {summary && (
                <p style={{ marginBottom: 12 }}>
                  <strong>{summary.total}</strong> real evidence rows
                  {summary.total > 0 && (
                    <> &mdash; {Object.entries(summary.totalByClass).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      {summary.staleCount > 0 && `, ${summary.staleCount} stale`}
                    </>
                  )}
                  {summary.total === 0 && ' (no data yet, not padded)'}
                </p>
              )}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: 6 }}>Module</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Class</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Claim</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Source</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Confidence</th>
                    <th style={{ textAlign: 'left', padding: 6 }}>Observed</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: 6 }}>{r.moduleKey}</td>
                      <td style={{ padding: 6 }}><Badge>{r.claimClass}</Badge></td>
                      <td style={{ padding: 6 }}>{r.claimText}</td>
                      <td style={{ padding: 6, fontFamily: 'monospace', fontSize: 12 }}>{r.sourceRef}</td>
                      <td style={{ padding: 6 }}>{r.confidence ?? '—'}</td>
                      <td style={{ padding: 6 }}>{new Date(r.observedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={6} style={{ padding: 12, color: '#888' }}>No evidence rows yet for this filter.</td></tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
