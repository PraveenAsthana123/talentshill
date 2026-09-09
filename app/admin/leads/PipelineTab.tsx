'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './LeadsShared.module.css';

interface LeadOption { id: string; fullName: string; company: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }

export default function PipelineTab() {
  const [leads, setLeads] = useState<LeadOption[]>([]);
  const [submissionId, setSubmissionId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [result, setResult] = useState<{ score: number; tier: string } | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=leads&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/leads/?limit=100').then((r) => (r.ok ? r.json() : { submissions: [] }))
      .then((d) => setLeads((d.submissions || []).map((s: { id: string; fullName: string; company: string }) => ({ id: s.id, fullName: s.fullName, company: s.company }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!submissionId) { setError('Select a lead first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/leads/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ submissionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStages(data.stages);
      setResult({ score: data.score, tier: data.tier });
      loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Score a lead deterministically using a real rubric grounded in the actual contact-form field values (project stage, budget, timeline, message substance, interest breadth) — same underlying operation as manually setting a score, run without human judgment calls.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Lead" options={leads.map((l) => ({ value: l.id, label: `${l.fullName} (${l.company})` }))} placeholder="Select a lead..." value={submissionId} onChange={(e) => setSubmissionId(e.target.value)} />
        <div className={styles.formActions}><Button onClick={run} disabled={running}>{running ? 'Scoring…' : 'Run Pipeline'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {stages && (
        <div className={styles.subSection}>
          <h4>Process (real stage-by-stage scoring)</h4>
          {result && <p>Result: <Badge variant={result.tier === 'hot' ? 'success' : result.tier === 'warm' ? 'accent' : 'warning'}>{result.score}/100 — {result.tier}</Badge></p>}
          <table className={styles.table}>
            <thead><tr><th>Stage</th><th>Input</th><th>Output</th></tr></thead>
            <tbody>{stages.map((s, i) => <tr key={i}><td>{s.stage}</td><td>{JSON.stringify(s.input)}</td><td>{JSON.stringify(s.output)}</td></tr>)}</tbody>
          </table>
        </div>
      )}
      <div className={styles.subSection}>
        <h4>Transactional history</h4>
        {runs.length === 0 && <p className={styles.empty}>No pipeline runs yet.</p>}
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Status</th><th>By</th></tr></thead>
          <tbody>{runs.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
