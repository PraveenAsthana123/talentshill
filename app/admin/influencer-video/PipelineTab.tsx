'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './InfluencerVideoShared.module.css';

interface CampaignOption { id: string; influencerName: string; status: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }
interface RoiSuggestion { campaignId: string; influencerName: string; platform: string; roi: number | null; action: string; reason: string }

export default function PipelineTab() {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [campaignId, setCampaignId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [roiRunning, setRoiRunning] = useState(false);
  const [roiSuggestions, setRoiSuggestions] = useState<RoiSuggestion[] | null>(null);
  const [roiError, setRoiError] = useState('');

  const runRoiScoring = async () => {
    setRoiRunning(true); setRoiError(''); setRoiSuggestions(null);
    try {
      const res = await fetch('/api/admin/influencer-video/roi-scoring/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setRoiSuggestions(data.suggestions);
      loadRuns();
    } catch (e) { setRoiError(String(e)); } finally { setRoiRunning(false); }
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=influencer_video&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/influencer-video?limit=200').then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setCampaigns((d.items || []).map((c: { id: string; influencerName: string; status: string }) => ({ id: c.id, influencerName: c.influencerName, status: c.status }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!campaignId) { setError('Select a campaign first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/influencer-video/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId }),
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
        <p>Score a campaign&apos;s real readiness — contact email present, deliverables defined, agreed fee set once active, status progressed. Writes to the real, previously-unused <code>influencer_campaigns.readiness_score</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Campaign" options={campaigns.map((c) => ({ value: c.id, label: `${c.influencerName} (${c.status})` }))} placeholder="Select a campaign..." value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
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
        <h4>Creator ROI &amp; renewal scoring (cross-creator, deterministic)</h4>
        <p>Ranks every creator with real logged metrics by ROI. Rule: ROI below 0% → do not renew; top half of scored creators with ROI ≥ 0% → renew; otherwise hold. Log metrics on the Manual tab first.</p>
        <div className={styles.formActions}><Button onClick={runRoiScoring} disabled={roiRunning}>{roiRunning ? 'Scoring…' : 'Run ROI Scoring'}</Button></div>
        {roiError && <p className={styles.error}>{roiError}</p>}
        {roiSuggestions && (
          roiSuggestions.length === 0 ? <p className={styles.empty}>No creators have logged metrics yet.</p> : (
            <table className={styles.table}>
              <thead><tr><th>Creator</th><th>Platform</th><th>ROI</th><th>Action</th><th>Reason</th></tr></thead>
              <tbody>{roiSuggestions.map((s) => (
                <tr key={s.campaignId}><td>{s.influencerName}</td><td>{s.platform}</td><td>{s.roi === null ? 'No data' : `${(s.roi * 100).toFixed(0)}%`}</td><td><Badge variant={s.action === 'renew' ? 'success' : s.action === 'drop' ? 'warning' : 'default'}>{s.action}</Badge></td><td>{s.reason}</td></tr>
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
