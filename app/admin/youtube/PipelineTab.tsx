'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './YoutubeShared.module.css';

interface VideoOption { id: string; title: string; status: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }
interface GrowthDelta { daysBetween: number; subscriberDelta: number; viewsDelta: number; watchTimeMinutesDelta: number | null; subscribersPerDay: number | null }
interface GrowthResult { hasEnoughData: boolean; previousSnapshot: { snapshotDate: string; subscriberCount: number; totalViews: number } | null; currentSnapshot: { snapshotDate: string; subscriberCount: number; totalViews: number } | null; delta: GrowthDelta | null }

export default function PipelineTab() {
  const [videos, setVideos] = useState<VideoOption[]>([]);
  const [videoId, setVideoId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [growthRunning, setGrowthRunning] = useState(false);
  const [growthResult, setGrowthResult] = useState<GrowthResult | null>(null);
  const [growthError, setGrowthError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=youtube&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/youtube?limit=200').then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setVideos((d.items || []).map((v: { id: string; title: string; status: string }) => ({ id: v.id, title: v.title, status: v.status }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!videoId) { setError('Select a video first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/youtube/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ videoId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStages(data.stages); setScore(data.score); loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  const runGrowth = async () => {
    setGrowthRunning(true); setGrowthError(''); setGrowthResult(null);
    try {
      const res = await fetch('/api/admin/youtube/channel-growth/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setGrowthResult(data);
      loadRuns();
    } catch (e) { setGrowthError(String(e)); } finally { setGrowthRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Score a video&apos;s real readiness — description present, tags present, real video ID set once published, status progressed. Writes to the real, previously-unused <code>youtube_videos.readiness_score</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Video" options={videos.map((v) => ({ value: v.id, label: `${v.title} (${v.status})` }))} placeholder="Select a video..." value={videoId} onChange={(e) => setVideoId(e.target.value)} />
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

      <div className={styles.subSection} style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
        <h4>Channel Growth (real diff between two real snapshots)</h4>
        <p>Computes a real diff between the two most recent real channel snapshots (Manual tab). Never a fabricated or interpolated trend — reports &quot;not enough data&quot; instead of guessing when fewer than 2 real snapshots exist.</p>
        <div className={styles.formActions}><Button onClick={runGrowth} disabled={growthRunning}>{growthRunning ? 'Computing…' : 'Run Growth Analysis'}</Button></div>
        {growthError && <p className={styles.error}>{growthError}</p>}
        {growthResult && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            {!growthResult.hasEnoughData ? (
              <p>Not enough data yet — log at least 2 real channel snapshots to compute a growth delta.</p>
            ) : (
              <p>
                Over <strong>{growthResult.delta!.daysBetween}</strong> days: subscribers <strong>{growthResult.delta!.subscriberDelta >= 0 ? '+' : ''}{growthResult.delta!.subscriberDelta}</strong>,
                {' '}views <strong>{growthResult.delta!.viewsDelta >= 0 ? '+' : ''}{growthResult.delta!.viewsDelta}</strong>
                {growthResult.delta!.watchTimeMinutesDelta !== null && <> · watch time <strong>{growthResult.delta!.watchTimeMinutesDelta >= 0 ? '+' : ''}{growthResult.delta!.watchTimeMinutesDelta}min</strong></>}
                {growthResult.delta!.subscribersPerDay !== null && <> ({growthResult.delta!.subscribersPerDay}/day)</>}
              </p>
            )}
          </div>
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
