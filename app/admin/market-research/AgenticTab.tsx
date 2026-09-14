'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './MarketResearchShared.module.css';

interface BriefOption { id: string; title: string; status: string }
interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [briefs, setBriefs] = useState<BriefOption[]>([]);
  const [briefId, setBriefId] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [synthesized, setSynthesized] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [oppRunning, setOppRunning] = useState(false);
  const [oppSteps, setOppSteps] = useState<StepRecord[] | null>(null);
  const [oppNarrative, setOppNarrative] = useState<string | null>(null);
  const [oppTokens, setOppTokens] = useState<number | null>(null);
  const [oppFabricationWarning, setOppFabricationWarning] = useState(false);
  const [oppError, setOppError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=market_research&executionMode=agentic&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/market-research?limit=200').then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setBriefs((d.items || []).map((b: { id: string; title: string; status: string }) => ({ id: b.id, title: b.title, status: b.status }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!briefId) { setError('Select a brief first.'); return; }
    setRunning(true); setError(''); setSteps(null); setSynthesized(null);
    try {
      const res = await fetch('/api/admin/market-research/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ briefId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSteps(data.steps); setSynthesized(data.synthesizedFindings); setTotalTokens(data.totalTokensUsed); loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  const runOpportunityRecommendation = async () => {
    setOppRunning(true); setOppError(''); setOppSteps(null); setOppNarrative(null);
    try {
      const res = await fetch('/api/admin/market-research/opportunity-scoring/agentic/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setOppSteps(data.steps); setOppNarrative(data.narrative); setOppTokens(data.totalTokensUsed); setOppFabricationWarning(data.fabricationWarning); loadRuns();
    } catch (e) { setOppError(String(e)); } finally { setOppRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>A real synthesis agent, not just an advisory score — drafts a findings summary strictly grounded in the brief&apos;s own real source notes (local Ollama, phi4-mini), never inventing statistics or names not present in your notes. Advisory only: the draft is <strong>not</strong> auto-saved to the brief — review it and copy it into the Manual tab&apos;s findings field yourself if you approve it.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Brief" options={briefs.map((b) => ({ value: b.id, label: `${b.title} (${b.status})` }))} placeholder="Select a brief..." value={briefId} onChange={(e) => setBriefId(e.target.value)} />
        <div className={styles.formActions}><Button onClick={run} disabled={running}>{running ? 'Agent running (30-60s)…' : 'Run Synthesis'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {steps && (
        <div className={styles.subSection}>
          <h4>Agent execution (real plan → search → act → execute → complete)</h4>
          {totalTokens !== null && <p>Total tokens used: <strong>{totalTokens}</strong></p>}
          {synthesized && (
            <div className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
              <div className={styles.cardHeader}><strong>Synthesized findings (draft — not saved)</strong></div>
              <div className={styles.field}>{synthesized}</div>
            </div>
          )}
          {steps.map((s, i) => (
            <div key={i} className={styles.card} style={{ marginTop: 'var(--space-3)' }}>
              <div className={styles.cardHeader}><strong>{i + 1}. {s.phase.toUpperCase()}</strong>{s.tokensUsed > 0 && <Badge variant="accent">{s.tokensUsed} tokens</Badge>}</div>
              <div className={styles.field}><span>Output:</span> {s.output.slice(0, 400)}{s.output.length > 400 ? '…' : ''}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.subSection} style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
        <h4>Opportunity Recommendation (portfolio-wide, compares briefs against each other)</h4>
        <p>Runs the real deterministic Opportunity Scoring pipeline, then asks the agent for a 3-5 sentence recommendation referencing only the real computed titles/ranks/scores — flagged automatically (<code>fabrication-guard.ts</code>) if it references any figure not given to it.</p>
        <div className={styles.formActions}><Button onClick={runOpportunityRecommendation} disabled={oppRunning}>{oppRunning ? 'Agent running (30-60s)…' : 'Run Opportunity Recommendation'}</Button></div>
        {oppError && <p className={styles.error}>{oppError}</p>}
        {oppSteps && (
          <>
            {oppTokens !== null && <p>Total tokens used: <strong>{oppTokens}</strong></p>}
            {oppNarrative && (
              <div className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
                <div className={styles.cardHeader}><strong>Recommendation</strong>{oppFabricationWarning && <Badge variant="warning">possible fabrication — verify</Badge>}</div>
                <div className={styles.field}>{oppNarrative}</div>
              </div>
            )}
            {oppSteps.map((s, i) => (
              <div key={i} className={styles.card} style={{ marginTop: 'var(--space-3)' }}>
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
