'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './BroadcastsShared.module.css';

interface BroadcastOption { id: string; name: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }

export default function PipelineTab() {
  const [broadcasts, setBroadcasts] = useState<BroadcastOption[]>([]);
  const [broadcastId, setBroadcastId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=broadcasts&executionMode=pipeline&limit=20')
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
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/broadcasts/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ broadcastId }),
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
        <p>Score a broadcast&apos;s real launch-readiness — HTML/subject substance, audience configured, sender profile set, and a sane throttle. Catches a real, pre-existing gap: <code>launchBroadcast()</code> has no guard today and will silently flip a broadcast to &quot;sending&quot; with no audience or sender configured. Writes to the real, previously-unused <code>broadcasts.readiness_score</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Broadcast" options={broadcasts.map((b) => ({ value: b.id, label: b.name }))} placeholder="Select a broadcast..." value={broadcastId} onChange={(e) => setBroadcastId(e.target.value)} />
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
