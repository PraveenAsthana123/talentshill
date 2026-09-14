'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './BroadcastsShared.module.css';

interface BroadcastOption { id: string; name: string }
interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [broadcasts, setBroadcasts] = useState<BroadcastOption[]>([]);
  const [broadcastId, setBroadcastId] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [draftRunning, setDraftRunning] = useState(false);
  const [draftSteps, setDraftSteps] = useState<StepRecord[] | null>(null);
  const [draftTemplate, setDraftTemplate] = useState<string | null>(null);
  const [draftAtRiskCount, setDraftAtRiskCount] = useState<number | null>(null);
  const [draftAvgDays, setDraftAvgDays] = useState<number | null>(null);
  const [draftFabricationWarning, setDraftFabricationWarning] = useState(false);
  const [draftTokens, setDraftTokens] = useState<number | null>(null);
  const [draftError, setDraftError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=broadcasts&executionMode=agentic&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/broadcasts').then((r) => (r.ok ? r.json() : { broadcasts: [] }))
      .then((d) => setBroadcasts((d.broadcasts || []).map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!broadcastId) { setError('Select a broadcast first.'); return; }
    setRunning(true); setError(''); setSteps(null);
    try {
      const res = await fetch('/api/admin/broadcasts/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ broadcastId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSteps(data.steps);
      setTotalTokens(data.totalTokensUsed);
      loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  const runDraft = async () => {
    setDraftRunning(true); setDraftError(''); setDraftSteps(null); setDraftTemplate(null);
    try {
      const res = await fetch('/api/admin/broadcasts/re-engagement/draft/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setDraftSteps(data.steps);
      setDraftTemplate(data.draftTemplate);
      setDraftAtRiskCount(data.atRiskCount);
      setDraftAvgDays(data.avgDaysInactive);
      setDraftFabricationWarning(data.fabricationWarning);
      setDraftTokens(data.totalTokensUsed);
      loadRuns();
    } catch (e) { setDraftError(String(e)); } finally { setDraftRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Reuses the real readiness pipeline as its &quot;search&quot; step, then drafts a real LLM-written pre-launch recommendation — local Ollama (phi4-mini), 1 agent (&quot;broadcast_readiness_advisor&quot;). Advisory only — never launches or edits the broadcast.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Broadcast" options={broadcasts.map((b) => ({ value: b.id, label: b.name }))} placeholder="Select a broadcast..." value={broadcastId} onChange={(e) => setBroadcastId(e.target.value)} />
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

      <div className={styles.subSection} style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
        <h4>Re-engagement Message Drafter (grounds copy in real at-risk aggregate stats)</h4>
        <p>Drafts a short SMS/WhatsApp-appropriate re-engagement template grounded only in the real count of at-risk contacts and their real average days inactive — never a specific discount/offer not given to it. Paste the result into the Pipeline tab&apos;s message template field.</p>
        <div className={styles.formActions}><Button onClick={runDraft} disabled={draftRunning}>{draftRunning ? 'Agent running (30-60s)…' : 'Draft Message'}</Button></div>
        {draftError && <p className={styles.error}>{draftError}</p>}
        {draftSteps && (
          <>
            {draftAtRiskCount !== null && <p>At-risk contacts: <strong>{draftAtRiskCount}</strong> · Avg days inactive: <strong>{draftAvgDays ?? 'unknown'}</strong> · Tokens: <strong>{draftTokens}</strong></p>}
            {draftTemplate && (
              <div className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
                <div className={styles.cardHeader}><strong>Draft template</strong>{draftFabricationWarning && <Badge variant="warning">possible fabrication — verify</Badge>}</div>
                <div className={styles.field}>{draftTemplate}</div>
              </div>
            )}
            {draftSteps.map((s, i) => (
              <div key={i} className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
                <div className={styles.cardHeader}><strong>{i + 1}. {s.phase.toUpperCase()}</strong>{s.tokensUsed > 0 && <Badge variant="accent">{s.tokensUsed} tokens</Badge>}</div>
                <div className={styles.field}><span>Output:</span> {s.output.slice(0, 400)}{s.output.length > 400 ? '…' : ''}</div>
              </div>
            ))}
          </>
        )}
      </div>

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
