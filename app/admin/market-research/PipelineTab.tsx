'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './MarketResearchShared.module.css';

interface BriefOption { id: string; title: string; status: string }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }
interface RankedBrief { id: string; title: string; opportunityScore: number; opportunityRank: number }

export default function PipelineTab() {
  const [briefs, setBriefs] = useState<BriefOption[]>([]);
  const [briefId, setBriefId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [rankingRunning, setRankingRunning] = useState(false);
  const [ranked, setRanked] = useState<RankedBrief[] | null>(null);
  const [scoredCount, setScoredCount] = useState<number | null>(null);
  const [skippedCount, setSkippedCount] = useState<number | null>(null);
  const [rankingError, setRankingError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=market_research&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/market-research?limit=200').then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d) => setBriefs((d.items || []).map((b: { id: string; title: string; status: string }) => ({ id: b.id, title: b.title, status: b.status }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!briefId) { setError('Select a brief first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/market-research/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ briefId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setStages(data.stages); setScore(data.score); loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  const runRanking = async () => {
    setRankingRunning(true); setRankingError(''); setRanked(null);
    try {
      const res = await fetch('/api/admin/market-research/opportunity-scoring/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setRanked(data.ranked); setScoredCount(data.scoredCount); setSkippedCount(data.skippedCount); loadRuns();
    } catch (e) { setRankingError(String(e)); } finally { setRankingRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Score a brief&apos;s real readiness — topic set, substantive source notes present, findings present, status progressed. Writes to the real, previously-unused <code>market_research_briefs.readiness_score</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Brief" options={briefs.map((b) => ({ value: b.id, label: `${b.title} (${b.status})` }))} placeholder="Select a brief..." value={briefId} onChange={(e) => setBriefId(e.target.value)} />
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
        <h4>Opportunity Scoring &amp; Ranking (portfolio-wide, distinct from per-brief readiness above)</h4>
        <p>Scores every brief with real SOM estimate + competition level + risk level + strategic-fit input entered (Manual tab), using a fixed disclosed formula: SOM tier (0-40) + competition (0-30, low competition scores highest) + risk (0-15, low risk scores highest) + strategic fit (0-15, scaled from your 0-100 input). Writes <code>opportunity_score</code> and <code>opportunity_rank</code> to each scorable brief.</p>
        <div className={styles.formActions}><Button onClick={runRanking} disabled={rankingRunning}>{rankingRunning ? 'Scoring…' : 'Run Opportunity Scoring'}</Button></div>
        {rankingError && <p className={styles.error}>{rankingError}</p>}
        {ranked && (
          <>
            <p>Scored <strong>{scoredCount}</strong> brief(s); skipped <strong>{skippedCount}</strong> (missing real inputs).</p>
            {ranked.length > 0 && (
              <table className={styles.table}>
                <thead><tr><th>Rank</th><th>Brief</th><th>Score</th></tr></thead>
                <tbody>{ranked.map((r) => <tr key={r.id}><td>{r.opportunityRank}</td><td>{r.title}</td><td>{r.opportunityScore}/100</td></tr>)}</tbody>
              </table>
            )}
          </>
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
