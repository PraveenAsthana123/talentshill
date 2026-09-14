'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './BrandingShared.module.css';

interface AssetOption { id: string; name: string; status: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }

export default function PipelineTab() {
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [assetId, setAssetId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [healthRunning, setHealthRunning] = useState(false);
  const [healthResult, setHealthResult] = useState<{ healthScore: number | null; scoredMentions: number; totalMentions: number; positiveMentions: number; neutralMentions: number; negativeMentions: number; competitorsTracked: number } | null>(null);
  const [healthError, setHealthError] = useState('');

  const runHealthSnapshot = async () => {
    setHealthRunning(true); setHealthError(''); setHealthResult(null);
    try {
      const res = await fetch('/api/admin/branding/health-snapshot/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: 'manual snapshot' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setHealthResult(data);
      loadRuns();
    } catch (e) { setHealthError(String(e)); } finally { setHealthRunning(false); }
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=branding&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/branding?limit=200').then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setAssets((d.items || []).map((a: { id: string; name: string; status: string }) => ({ id: a.id, name: a.name, status: a.status }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!assetId) { setError('Select an asset first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/branding/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId }),
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
        <p>Score an asset&apos;s real readiness — file attached, description present, approved status, real version number. Writes to the real, previously-unused <code>brand_assets.readiness_score</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Asset" options={assets.map((a) => ({ value: a.id, label: `${a.name} (${a.status})` }))} placeholder="Select an asset..." value={assetId} onChange={(e) => setAssetId(e.target.value)} />
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
        <h4>Brand health snapshot (cross-mention, deterministic)</h4>
        <p>Aggregates all real, sentiment-scored mentions (Manual tab) into a 0-100 health score: <code>round(((positive-negative)/scored + 1) / 2 * 100)</code>. Unscored mentions and a real competitor-tracked count are reported alongside, never folded into a fabricated competitive score.</p>
        <div className={styles.formActions}><Button onClick={runHealthSnapshot} disabled={healthRunning}>{healthRunning ? 'Snapshotting…' : 'Run Health Snapshot'}</Button></div>
        {healthError && <p className={styles.error}>{healthError}</p>}
        {healthResult && (
          healthResult.healthScore === null ? <p className={styles.empty}>No scored mentions yet.</p> : (
            <table className={styles.table}>
              <thead><tr><th>Health Score</th><th>Positive</th><th>Neutral</th><th>Negative</th><th>Unscored</th><th>Competitors Tracked</th></tr></thead>
              <tbody><tr>
                <td><Badge variant="accent">{healthResult.healthScore}/100</Badge></td>
                <td>{healthResult.positiveMentions}</td><td>{healthResult.neutralMentions}</td><td>{healthResult.negativeMentions}</td>
                <td>{healthResult.totalMentions - healthResult.scoredMentions}</td><td>{healthResult.competitorsTracked}</td>
              </tr></tbody>
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
