'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './ReelsManagementShared.module.css';

interface ReelOption { id: string; title: string; status: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }

export default function PipelineTab() {
  const [reels, setReels] = useState<ReelOption[]>([]);
  const [reelId, setReelId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=reels_management&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/reels-management?limit=200').then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setReels((d.items || []).map((r: { id: string; title: string; status: string }) => ({ id: r.id, title: r.title, status: r.status }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!reelId) { setError('Select a reel first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/reels-management/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reelId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStages(data.stages); setScore(data.score); loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Score a reel&apos;s real readiness — caption present, asset URL set once edited/scheduled/published, scheduledAt set once scheduled/published, status progressed. Writes to the real, previously-unused <code>reels.readiness_score</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Reel" options={reels.map((r) => ({ value: r.id, label: `${r.title} (${r.status})` }))} placeholder="Select a reel..." value={reelId} onChange={(e) => setReelId(e.target.value)} />
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
