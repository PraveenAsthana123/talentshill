'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './SurveyShared.module.css';

interface ResponseOption { id: string; contactName: string | null; company: string | null }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }

export default function PipelineTab() {
  const [responses, setResponses] = useState<ResponseOption[]>([]);
  const [responseId, setResponseId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=survey&executionMode=pipeline&limit=20')
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
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/survey/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ responseId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStages(data.stages);
      setScore(data.score);
      loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Score a survey respondent&apos;s outreach priority deterministically using a real rubric grounded in their actual submitted score, contact-info completeness, and recency — writes to the real, previously-unused <code>survey_responses.outreach_priority</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Response" options={responses.map((r) => ({ value: r.id, label: `${r.contactName || 'Anonymous'}${r.company ? ` (${r.company})` : ''}` }))} placeholder="Select a response..." value={responseId} onChange={(e) => setResponseId(e.target.value)} />
        <div className={styles.formActions}><Button onClick={run} disabled={running}>{running ? 'Scoring…' : 'Run Pipeline'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {stages && (
        <div className={styles.subSection}>
          <h4>Process (real stage-by-stage scoring)</h4>
          {score !== null && <p>Result: <Badge variant="accent">{score}/100</Badge></p>}
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
