'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './ContentShared.module.css';

interface ContentOption { id: string; title: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }
interface ContentSuggestion { contentId: string; title: string; contentType: string; conversionRate: number | null; action: string; reason: string }

export default function PipelineTab() {
  const [items, setItems] = useState<ContentOption[]>([]);
  const [contentId, setContentId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [perfRunning, setPerfRunning] = useState(false);
  const [perfSuggestions, setPerfSuggestions] = useState<ContentSuggestion[] | null>(null);
  const [perfError, setPerfError] = useState('');

  const runPerformance = async () => {
    setPerfRunning(true); setPerfError(''); setPerfSuggestions(null);
    try {
      const res = await fetch('/api/admin/content/performance/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setPerfSuggestions(data.suggestions);
      loadRuns();
    } catch (e) { setPerfError(String(e)); } finally { setPerfRunning(false); }
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=content&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/content?limit=200').then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setItems((d.items || []).map((c: { id: string; title: string }) => ({ id: c.id, title: c.title }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!contentId) { setError('Select a content item first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/content/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentId }),
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
        <p>Score a content item&apos;s real publish-readiness — body/excerpt/category/tags/cover-image/title substance. Catches a real, pre-existing gap: <code>publishContent()</code> has no guard today and will happily publish an item with an empty body or missing metadata. Writes to the real, previously-unused <code>marketing_content.readiness_score</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Content" options={items.map((c) => ({ value: c.id, label: c.title }))} placeholder="Select a content item..." value={contentId} onChange={(e) => setContentId(e.target.value)} />
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
        <h4>Content performance &amp; optimization (cross-content, deterministic)</h4>
        <p>Ranks every content item with real logged engagement by conversion rate (leads/views). Rule: top half → produce more like it; bottom half → deprioritize; no data → hold. Log engagement on the Manual tab first.</p>
        <div className={styles.formActions}><Button onClick={runPerformance} disabled={perfRunning}>{perfRunning ? 'Scoring…' : 'Run Performance Scoring'}</Button></div>
        {perfError && <p className={styles.error}>{perfError}</p>}
        {perfSuggestions && (
          perfSuggestions.length === 0 ? <p className={styles.empty}>No content has logged engagement yet.</p> : (
            <table className={styles.table}>
              <thead><tr><th>Title</th><th>Type</th><th>Conversion</th><th>Action</th><th>Reason</th></tr></thead>
              <tbody>{perfSuggestions.map((s) => (
                <tr key={s.contentId}><td>{s.title}</td><td>{s.contentType}</td><td>{s.conversionRate === null ? 'No data' : `${(s.conversionRate * 100).toFixed(1)}%`}</td><td><Badge variant={s.action === 'produce_more' ? 'success' : s.action === 'deprioritize' ? 'warning' : 'default'}>{s.action}</Badge></td><td>{s.reason}</td></tr>
              ))}</tbody>
            </table>
          )
        )}
      </div>
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
