'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './MediaShared.module.css';

interface MediaOption { id: string; originalName: string }
interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [media, setMedia] = useState<MediaOption[]>([]);
  const [mediaId, setMediaId] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=media&executionMode=agentic&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/media?limit=200').then((r) => (r.ok ? r.json() : { media: [] }))
      .then((d) => setMedia((d.media || []).map((m: { id: string; originalName: string }) => ({ id: m.id, originalName: m.originalName }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!mediaId) { setError('Select a file first.'); return; }
    setRunning(true); setError(''); setSteps(null);
    try {
      const res = await fetch('/api/admin/media/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mediaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSteps(data.steps);
      setTotalTokens(data.totalTokensUsed);
      loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Reuses the real integrity pipeline as its &quot;search&quot; step, then drafts a real LLM-written recommendation — local Ollama (phi4-mini), 1 agent (&quot;media_integrity_advisor&quot;). Advisory only — never deletes or edits the media record beyond the readiness score already written.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="File" options={media.map((m) => ({ value: m.id, label: m.originalName }))} placeholder="Select a file..." value={mediaId} onChange={(e) => setMediaId(e.target.value)} />
        <div className={styles.formActions}><Button onClick={run} disabled={running}>{running ? 'Agent running (30-60s)…' : 'Run Agent'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {steps && (
        <div className={styles.subSection}>
          <h4>Agent execution (real plan → search → act → execute → complete)</h4>
          {totalTokens !== null && <p>Total tokens used: <strong>{totalTokens}</strong></p>}
          {steps.map((s, i) => (
            <div key={i} className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
              <div className={styles.cardHeader}><strong>{i + 1}. {s.phase.toUpperCase()}</strong>{s.tokensUsed > 0 && <Badge variant="accent">{s.tokensUsed} tokens</Badge>}</div>
              <div className={styles.field}><span>Output:</span> {s.output.slice(0, 400)}{s.output.length > 400 ? '…' : ''}</div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.subSection}>
        <h4>Transactional history</h4>
        {runs.length === 0 && <p className={styles.empty}>No agent runs yet.</p>}
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Status</th><th>Tokens</th><th>By</th></tr></thead>
          <tbody>{runs.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.tokensUsed ?? '—'}</td><td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
