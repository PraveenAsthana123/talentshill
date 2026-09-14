'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './AdsManagementShared.module.css';

interface CampaignOption { id: string; name: string; status: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }
interface BudgetSuggestion { campaignId: string; name: string; platform: string; roas: number | null; action: string; suggestedDeltaPct: number; reason: string }

export default function PipelineTab() {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [campaignId, setCampaignId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [optimizing, setOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<BudgetSuggestion[] | null>(null);
  const [optError, setOptError] = useState('');

  const runBudgetOptimization = async () => {
    setOptimizing(true); setOptError(''); setSuggestions(null);
    try {
      const res = await fetch('/api/admin/ads-management/budget-optimization/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSuggestions(data.suggestions);
      loadRuns();
    } catch (e) { setOptError(String(e)); } finally { setOptimizing(false); }
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=ads_management&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/ads-management?limit=200').then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setCampaigns((d.items || []).map((c: { id: string; name: string; status: string }) => ({ id: c.id, name: c.name, status: c.status }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!campaignId) { setError('Select a campaign first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/ads-management/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId }),
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
        <p>Score a campaign&apos;s real readiness — objective+budget set, target audience defined, creative attached, valid date range. Writes to the real, previously-unused <code>ad_campaigns.readiness_score</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Campaign" options={campaigns.map((c) => ({ value: c.id, label: `${c.name} (${c.status})` }))} placeholder="Select a campaign..." value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
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
        <h4>Budget optimization (cross-campaign, deterministic)</h4>
        <p>Ranks every campaign with real logged metrics by ROAS. Rule: ROAS below 1.0 → decrease 20%; top half of scored campaigns with ROAS ≥ 1.0 → increase 15%; otherwise hold. Campaigns with no metric entries are excluded, never scored with invented numbers. Log metrics on the Manual tab first.</p>
        <div className={styles.formActions}><Button onClick={runBudgetOptimization} disabled={optimizing}>{optimizing ? 'Optimizing…' : 'Run Budget Optimization'}</Button></div>
        {optError && <p className={styles.error}>{optError}</p>}
        {suggestions && (
          suggestions.length === 0 ? <p className={styles.empty}>No campaigns have logged metrics yet.</p> : (
            <table className={styles.table}>
              <thead><tr><th>Campaign</th><th>Platform</th><th>ROAS</th><th>Action</th><th>Reason</th></tr></thead>
              <tbody>{suggestions.map((s) => (
                <tr key={s.campaignId}><td>{s.name}</td><td>{s.platform}</td><td>{s.roas === null ? 'No data' : s.roas.toFixed(2)}</td><td><Badge variant={s.action === 'increase' ? 'success' : s.action === 'decrease' ? 'warning' : 'default'}>{s.action} {s.suggestedDeltaPct !== 0 ? `${s.suggestedDeltaPct}%` : ''}</Badge></td><td>{s.reason}</td></tr>
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
