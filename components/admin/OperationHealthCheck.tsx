'use client';

import { useEffect, useState } from 'react';

interface HealthData {
  ollama: { reachable: boolean; latencyMs: number | null; checkedAt: string };
  stuckRuns: { id: string; moduleKey: string; operationName: string; executionMode: string; createdAt: string }[];
  stuckRunCount: number;
  failedRunCount: number;
  failureCategories: Record<string, number>;
}

// Shared health-check widget for any module's Monitoring tab: real Ollama
// connectivity, real stuck/deadlocked-run detection, real categorized
// failure counts. Reused across modules rather than rebuilt per module.
export default function OperationHealthCheck({ moduleKey }: { moduleKey: string }) {
  const [data, setData] = useState<HealthData | null>(null);

  useEffect(() => {
    fetch(`/api/admin/operation-runs/health/?moduleKey=${moduleKey}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {});
  }, [moduleKey]);

  if (!data) return null;

  return (
    <div style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', fontSize: 'var(--font-size-sm)' }}>
      <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
        <span>
          Ollama: <strong style={{ color: data.ollama.reachable ? '#059669' : '#dc2626' }}>
            {data.ollama.reachable ? `reachable (${data.ollama.latencyMs}ms)` : 'unreachable'}
          </strong>
        </span>
        <span>Stuck/deadlocked runs: <strong style={{ color: data.stuckRunCount > 0 ? '#dc2626' : 'inherit' }}>{data.stuckRunCount}</strong></span>
        <span>Failed runs (all time): <strong>{data.failedRunCount}</strong></span>
        {Object.keys(data.failureCategories).length > 0 && (
          <span>By category: {Object.entries(data.failureCategories).map(([k, v]) => `${k}: ${v}`).join(', ')}</span>
        )}
      </div>
      {data.stuckRuns.length > 0 && (
        <div style={{ marginTop: 'var(--space-3)', color: '#dc2626' }}>
          {data.stuckRuns.map((r) => (
            <div key={r.id}>⚠ {r.operationName} ({r.executionMode}) has been &quot;running&quot; since {new Date(r.createdAt).toLocaleString()} — likely stuck</div>
          ))}
        </div>
      )}
    </div>
  );
}
