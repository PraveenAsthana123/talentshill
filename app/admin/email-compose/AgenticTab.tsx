'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './ComposeShared.module.css';

interface EmailProfile { id: string; name: string; fromEmail: string; }
interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [profiles, setProfiles] = useState<EmailProfile[]>([]);
  const [form, setForm] = useState({ to: '', subject: '', html: '', profileId: '' });
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=email_compose&executionMode=agentic&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/email-profiles').then((r) => (r.ok ? r.json() : { profiles: [] }))
      .then((d) => setProfiles(d.profiles || [])).catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!form.to || !form.subject || !form.html) { setError('Fill in To, Subject, and HTML first.'); return; }
    setRunning(true); setError(''); setSteps(null);
    try {
      const res = await fetch('/api/admin/email-compose/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
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
        <p>Reuses the real readiness pipeline as its &quot;search&quot; step, then drafts a real LLM-written pre-send recommendation — local Ollama (phi4-mini), 1 agent (&quot;compose_readiness_advisor&quot;). Advisory only — never sends the email.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <input placeholder="To (email)" value={form.to} onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))} style={{ width: '100%', marginBottom: 'var(--space-3)', padding: 'var(--space-2)' }} />
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} style={{ width: '100%', marginBottom: 'var(--space-3)', padding: 'var(--space-2)' }} />
        <textarea placeholder="HTML content" value={form.html} onChange={(e) => setForm((p) => ({ ...p, html: e.target.value }))} style={{ width: '100%', marginBottom: 'var(--space-3)', padding: 'var(--space-2)', minHeight: '80px' }} />
        <Select label="Sender profile" options={profiles.map((p) => ({ value: p.id, label: `${p.name} (${p.fromEmail})` }))} placeholder="Default Profile" value={form.profileId} onChange={(e) => setForm((p) => ({ ...p, profileId: e.target.value }))} />
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
