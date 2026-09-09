'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './SurveyShared.module.css';

interface ResponseOption { id: string; contactName: string | null; company: string | null }
interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [responses, setResponses] = useState<ResponseOption[]>([]);
  const [responseId, setResponseId] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=survey&executionMode=agentic&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/survey?limit=100').then((r) => (r.ok ? r.json() : { responses: [] }))
      .then((d) => setResponses((d.responses || []).map((r: { id: string; contactName: string | null; company: string | null }) => ({ id: r.id, contactName: r.contactName, company: r.company }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!responseId) { setError('Select a response first.'); return; }
    setRunning(true); setError(''); setSteps(null);
    try {
      const res = await fetch('/api/admin/survey/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responseId }),
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
        <p>Reuses the real outreach-priority pipeline as its &quot;search&quot; step, then drafts a real LLM-written follow-up recommendation — local Ollama (phi4-mini), 1 agent (&quot;survey_outreach_advisor&quot;). Advisory only — never contacts the respondent.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Response" options={responses.map((r) => ({ value: r.id, label: `${r.contactName || 'Anonymous'}${r.company ? ` (${r.company})` : ''}` }))} placeholder="Select a response..." value={responseId} onChange={(e) => setResponseId(e.target.value)} />
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
