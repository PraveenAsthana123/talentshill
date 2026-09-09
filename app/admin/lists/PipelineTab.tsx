'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './ListsShared.module.css';

interface ListOption { id: string; name: string; type: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }

export default function PipelineTab() {
  const [lists, setLists] = useState<ListOption[]>([]);
  const [listId, setListId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [result, setResult] = useState<{ added: number; removed: number; finalMemberCount: number } | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=lists&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/lists').then((r) => (r.ok ? r.json() : { lists: [] }))
      .then((d) => setLists((d.lists || []).map((l: { id: string; name: string; type: string }) => ({ id: l.id, name: l.name, type: l.type }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!listId) { setError('Select a list first.'); return; }
    setRunning(true); setError(''); setStages(null); setResult(null);
    try {
      const res = await fetch('/api/admin/lists/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ listId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStages(data.stages);
      setResult({ added: data.added, removed: data.removed, finalMemberCount: data.finalMemberCount });
      loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Real functional sync, not just a score: evaluates a dynamic list&apos;s segment rules against the full (unlimited) contact set and adds/removes real <code>listMembers</code> rows to match — closing the gap where <code>lib/jobs/handlers/broadcast-sender.ts</code> reads membership directly and never evaluates segment rules itself. Static lists are correctly reported as not applicable. Writes to the real, previously-unused <code>lists.last_synced_at</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="List" options={lists.map((l) => ({ value: l.id, label: `${l.name} (${l.type})` }))} placeholder="Select a list..." value={listId} onChange={(e) => setListId(e.target.value)} />
        <div className={styles.formActions}><Button onClick={run} disabled={running}>{running ? 'Syncing…' : 'Run Pipeline'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {stages && (
        <div className={styles.subSection}>
          <h4>Process (real stage-by-stage sync)</h4>
          {result && <p>Result: <Badge variant="accent">+{result.added} / -{result.removed}, final count {result.finalMemberCount}</Badge></p>}
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
