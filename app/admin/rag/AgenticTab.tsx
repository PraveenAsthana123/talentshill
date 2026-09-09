'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './RagShared.module.css';

interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface Source { chunkId: string; preview: string; score: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [question, setQuestion] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=rag&executionMode=agentic&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => { loadRuns(); }, []);

  const run = async () => {
    if (!question.trim()) { setError('Enter a question first.'); return; }
    setRunning(true); setError(''); setSteps(null); setAnswer(null); setSources([]);
    try {
      const res = await fetch('/api/admin/rag/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSteps(data.steps);
      setAnswer(data.answer);
      setSources(data.sources || []);
      setTotalTokens(data.totalTokensUsed);
      loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>The first genuinely RAG-powered answer synthesis in this app — per this workspace&apos;s RAG+Ollama mandatory policy&apos;s warning that an &quot;AI-powered/RAG-powered&quot; chatbot that is actually keyword matching does not satisfy it. Real hybrid search (now backed by real Ollama embeddings) retrieves context; local Ollama synthesizes an answer strictly from that context, citing sources by number, and says so explicitly if the context doesn&apos;t contain the answer.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <textarea className={styles.textarea || ''} style={{ width: '100%', minHeight: 80, padding: 'var(--space-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: 'var(--font-size-sm)' }} placeholder="Ask a question about the ingested documents..." value={question} onChange={(e) => setQuestion(e.target.value)} />
        <div className={styles.formActions}><Button onClick={run} disabled={running}>{running ? 'Agent running (30-60s)…' : 'Run Agent'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {steps && (
        <div className={styles.subSection}>
          <h4>Agent execution (real plan → search → act → execute → complete)</h4>
          {totalTokens !== null && <p>Total tokens used: <strong>{totalTokens}</strong></p>}
          {answer && (
            <div className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
              <div className={styles.cardHeader}><strong>Answer</strong></div>
              <div className={styles.field}>{answer}</div>
            </div>
          )}
          {sources.length > 0 && (
            <table className={styles.table}>
              <thead><tr><th>#</th><th>Chunk</th><th>Score</th><th>Preview</th></tr></thead>
              <tbody>{sources.map((s, i) => <tr key={s.chunkId}><td>{i + 1}</td><td>{s.chunkId.slice(0, 8)}</td><td>{s.score.toFixed(3)}</td><td>{s.preview}</td></tr>)}</tbody>
            </table>
          )}
          {steps.map((s, i) => (
            <div key={i} className={styles.card} style={{ marginTop: 'var(--space-3)' }}>
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
