'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Input, Select } from '@/components/ui/Input';
import styles from './AdminCompetitorAnalysis.module.css';

interface ServiceRow { id: string; name: string; category: string }

interface StepRecord {
  phase: 'plan' | 'search' | 'act' | 'execute' | 'complete';
  agentRole: string;
  input: string;
  output: string;
  tokensUsed: number;
}

interface RunEntry {
  id: string;
  status: string;
  tokensUsed: number | null;
  triggeredBy: string | null;
  createdAt: string;
}

export default function AgenticTab() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [form, setForm] = useState({ serviceId: '', competitorName: '', competitorWebsite: '' });
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=competitor_analysis&executionMode=agentic&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] }))
      .then((d) => setRuns(d.runs || []))
      .catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/services/').then((r) => (r.ok ? r.json() : { services: [] })).then((d) => setServices(d.services || [])).catch(() => {});
    loadRuns();
  }, []);

  const runAgent = async () => {
    if (!form.serviceId || !form.competitorName) {
      setError('Service and competitor name are required.');
      return;
    }
    setRunning(true);
    setError('');
    setSteps(null);
    try {
      const res = await fetch('/api/admin/competitor-analysis/agentic/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSteps(data.steps);
      setTotalTokens(data.totalTokensUsed);
      loadRuns();
    } catch (e) {
      setError(String(e));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Same operation as Manual/Pipeline, run by a real AI agent that decides its own plan and drafts analysis text -- backed by a local Ollama model (phi4-mini), not a cloud API.</p>
        <p><strong>Honest scope:</strong> 1 agent, role &quot;competitor_researcher&quot;. Its plan and analysis are real LLM output -- genuinely generated, not scripted -- but not guaranteed correct. &quot;Search&quot; is a real HTTP fetch of the competitor&apos;s own site (no search-engine API is configured, so it can&apos;t search the broader web). Every agent-created entry stays in <code>needs_research</code>, clearly prefixed &quot;[AI-drafted, needs human review]&quot;.</p>
      </div>

      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select
          label="Service"
          options={services.map((s) => ({ value: s.id, label: `${s.name} (${s.category})` }))}
          placeholder="Select a service..."
          value={form.serviceId}
          onChange={(ev) => setForm({ ...form, serviceId: ev.target.value })}
        />
        <Input label="Competitor name" value={form.competitorName} onChange={(ev) => setForm({ ...form, competitorName: ev.target.value })} />
        <Input label="Competitor website (optional)" value={form.competitorWebsite} onChange={(ev) => setForm({ ...form, competitorWebsite: ev.target.value })} placeholder="https://..." />
        <div className={styles.formActions}>
          <Button onClick={runAgent} disabled={running}>{running ? 'Agent running (calls a local LLM, may take 10-30s)…' : 'Run Agent'}</Button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {steps && (
        <div className={styles.subSection}>
          <h4>Agent execution (real plan → search → act → execute → complete loop)</h4>
          <p>1 agent used ({steps[0]?.agentRole}). {totalTokens !== null && <>Total tokens used: <strong>{totalTokens}</strong> (real, from Ollama&apos;s response).</>}</p>
          {steps.map((s, i) => (
            <div key={i} className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
              <div className={styles.cardHeader}>
                <strong>{i + 1}. {s.phase.toUpperCase()}</strong>
                {s.tokensUsed > 0 && <Badge variant="accent">{s.tokensUsed} tokens</Badge>}
              </div>
              <div className={styles.field}><span>Input:</span> {s.input.slice(0, 300)}{s.input.length > 300 ? '…' : ''}</div>
              <div className={styles.field}><span>Output:</span> {s.output.slice(0, 500)}{s.output.length > 500 ? '…' : ''}</div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.subSection}>
        <h4>Transactional history (real agent runs, timestamped, with token usage)</h4>
        {runs.length === 0 && <p className={styles.empty}>No agent runs yet.</p>}
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Status</th><th>Tokens</th><th>By</th></tr></thead>
          <tbody>
            {runs.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString()}</td>
                <td><Badge variant={r.status === 'completed' ? 'success' : r.status === 'failed' ? 'error' : 'warning'}>{r.status}</Badge></td>
                <td>{r.tokensUsed ?? '—'}</td>
                <td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
