'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './ContactsShared.module.css';

interface ContactOption { id: string; email: string; company: string | null }
interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [contactId, setContactId] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [retentionRunning, setRetentionRunning] = useState(false);
  const [retentionNarrative, setRetentionNarrative] = useState('');
  const [retentionError, setRetentionError] = useState('');

  const runRetentionAgent = async () => {
    setRetentionRunning(true); setRetentionError(''); setRetentionNarrative('');
    try {
      const res = await fetch('/api/admin/contacts/activation-scoring/agentic/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setRetentionNarrative(data.narrative || '');
      loadRuns();
    } catch (e) { setRetentionError(String(e)); } finally { setRetentionRunning(false); }
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=contacts&executionMode=agentic&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/contacts/?limit=100').then((r) => (r.ok ? r.json() : { contacts: [] }))
      .then((d) => setContacts((d.contacts || []).map((c: { id: string; email: string; company: string | null }) => ({ id: c.id, email: c.email, company: c.company }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!contactId) { setError('Select a contact first.'); return; }
    setRunning(true); setError(''); setSteps(null);
    try {
      const res = await fetch('/api/admin/contacts/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId }),
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
        <p>Reuses the real completeness pipeline as its &quot;search&quot; step, then drafts a real LLM-written engagement recommendation — local Ollama (phi4-mini), 1 agent (&quot;contact_engagement_advisor&quot;). Advisory only — never contacts anyone, never sends anything.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Contact" options={contacts.map((c) => ({ value: c.id, label: `${c.email}${c.company ? ` (${c.company})` : ''}` }))} placeholder="Select a contact..." value={contactId} onChange={(e) => setContactId(e.target.value)} />
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
        <h4>Retention narrative (behavioral lifecycle, cross-contact, Ollama)</h4>
        <p>Distinct from the &quot;contact_engagement_advisor&quot; agent above (which narrates the static completeness score): this agent (&quot;contact_retention_advisor&quot;) runs the real behavioral activation-scoring pipeline across all contacts, then narrates the real lifecycle distribution.</p>
        <div className={styles.formActions}><Button onClick={runRetentionAgent} disabled={retentionRunning}>{retentionRunning ? 'Agent running (30-60s)…' : 'Run Retention Agent'}</Button></div>
        {retentionError && <p className={styles.error}>{retentionError}</p>}
        {retentionNarrative && <div className={styles.card}><p>{retentionNarrative}</p></div>}
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
