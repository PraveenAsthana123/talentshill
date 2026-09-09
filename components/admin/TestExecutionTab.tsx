'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui';

interface TestExecution {
  id: string;
  moduleKey: string;
  executionMode: string | null;
  caseName: string;
  description: string | null;
  expectedResult: string;
  actualResult: string;
  status: 'pass' | 'fail';
  testData: unknown;
  logOutput: string | null;
  executedAt: string;
  executedBy: string | null;
}

// Shared, real, DB-backed Testing tab for any module adopting the
// Operational Portal 10-tab standard. Replaces per-module hardcoded
// test-case arrays -- every row here is a real recordTestExecution()
// call made at the moment a real verification happened.
export default function TestExecutionTab({ moduleKey }: { moduleKey: string }) {
  const [data, setData] = useState<{ executions: TestExecution[]; count: number; passCount: number; failCount: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/admin/test-executions/?moduleKey=${moduleKey}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(setData)
      .catch((e) => setError(String(e)));
  }, [moduleKey]);

  if (error) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!data) return <p>Loading…</p>;

  return (
    <div>
      <h4 style={{ fontSize: 'var(--font-size-sm)', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
        Test executions ({data.passCount}/{data.count} passed) — real, persisted, not hardcoded
      </h4>
      {data.executions.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>No test executions recorded yet for this module.</p>}
      {data.executions.map((e) => (
        <div key={e.id} style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
            <strong>{e.caseName}</strong>
            <Badge variant={e.status === 'pass' ? 'success' : 'error'}>{e.status.toUpperCase()}</Badge>
          </div>
          {e.executionMode && <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>{e.executionMode} · {new Date(e.executedAt).toLocaleString()} · by {e.executedBy ? e.executedBy.slice(0, 8) : 'system'}</div>}
          <div style={{ marginTop: 'var(--space-2)' }}><strong>Expected:</strong> {e.expectedResult}</div>
          <div><strong>Actual:</strong> {e.actualResult}</div>
          {e.logOutput && <details style={{ marginTop: 'var(--space-2)' }}><summary style={{ cursor: 'pointer', color: 'var(--color-text-muted)' }}>Raw log/evidence</summary><pre style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--font-size-xs)', background: 'var(--color-surface)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', marginTop: 'var(--space-1)' }}>{e.logOutput}</pre></details>}
        </div>
      ))}
    </div>
  );
}
