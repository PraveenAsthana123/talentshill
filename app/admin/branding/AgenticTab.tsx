'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './BrandingShared.module.css';

interface AssetOption { id: string; name: string; status: string }
interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [assetId, setAssetId] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [healthRunning, setHealthRunning] = useState(false);
  const [healthNarrative, setHealthNarrative] = useState('');
  const [healthError, setHealthError] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [liftResult, setLiftResult] = useState<{ preSnapshot: { healthScore: number } | null; postSnapshot: { healthScore: number } | null; lift: number | null } | null>(null);
  const [liftError, setLiftError] = useState('');

  const runHealthAgent = async () => {
    setHealthRunning(true); setHealthError(''); setHealthNarrative('');
    try {
      const res = await fetch('/api/admin/branding/health-snapshot/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: 'agentic snapshot', campaignId: campaignId || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setHealthNarrative(data.narrative || '');
      loadRuns();
    } catch (e) { setHealthError(String(e)); } finally { setHealthRunning(false); }
  };

  const checkLift = async () => {
    if (!campaignId) { setLiftError('Enter a campaign ID first.'); return; }
    setLiftError(''); setLiftResult(null);
    try {
      const res = await fetch(`/api/admin/branding/campaign-lift/?campaignId=${campaignId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setLiftResult(data);
    } catch (e) { setLiftError(String(e)); }
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=branding&executionMode=agentic&limit=20')
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
    setRunning(true); setError(''); setSteps(null);
    try {
      const res = await fetch('/api/admin/branding/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSteps(data.steps); setTotalTokens(data.totalTokensUsed); loadRuns();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Reuses the real readiness pipeline as its &quot;search&quot; step, then drafts a real LLM-written recommendation — local Ollama (phi4-mini), 1 agent (&quot;brand_asset_readiness_advisor&quot;). Advisory only.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Asset" options={assets.map((a) => ({ value: a.id, label: `${a.name} (${a.status})` }))} placeholder="Select an asset..." value={assetId} onChange={(e) => setAssetId(e.target.value)} />
        <div className={styles.formActions}><Button onClick={run} disabled={running}>{running ? 'Agent running (30-60s)…' : 'Run Agent'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
      {steps && (
        <div className={styles.subSection}>
          <h4>Agent execution (real plan → search → act → execute → complete)</h4>
          {totalTokens !== null && <p>Total tokens used: <strong>{totalTokens}</strong></p>}
          {steps.map((s, i) => (
            <div key={i} className={styles.card} style={{ marginBottom: 'var(--space-3)' }}>
              <div className={styles.cardHeader}><strong>{i + 1}. {s.phase.toUpperCase()}</strong>{s.tokensUsed > 0 && <Badge variant="accent">{s.tokensUsed} tokens</Badge>}</div>
              <div className={styles.field}><span>Output:</span> {s.output.slice(0, 400)}{s.output.length > 400 ? '…' : ''}</div>
            </div>
          ))}
        </div>
      )}
      <div className={styles.subSection}>
        <h4>Brand health narrative &amp; campaign lift (cross-mention, Ollama)</h4>
        <p>Runs the deterministic health-snapshot pipeline, then asks the local model to turn the real numbers into a strategic narrative. Optionally tag a campaign ID to measure real before/after lift (requires two real snapshots taken with the same campaign ID, one before and one after the campaign).</p>
        <input style={{ display: 'block', width: '100%', padding: 'var(--space-2)', marginBottom: 'var(--space-2)' }} placeholder="Campaign ID (optional)" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
        <div className={styles.formActions}>
          <Button onClick={runHealthAgent} disabled={healthRunning}>{healthRunning ? 'Agent running (30-60s)…' : 'Run Health Narrative Agent'}</Button>
          <Button onClick={checkLift}>Check Campaign Lift</Button>
        </div>
        {healthError && <p className={styles.error}>{healthError}</p>}
        {healthNarrative && <div className={styles.card}><p>{healthNarrative}</p></div>}
        {liftError && <p className={styles.error}>{liftError}</p>}
        {liftResult && (
          <p>
            Pre: {liftResult.preSnapshot ? `${liftResult.preSnapshot.healthScore}/100` : 'no snapshot yet'} → Post: {liftResult.postSnapshot ? `${liftResult.postSnapshot.healthScore}/100` : 'no post-campaign snapshot yet'}
            {liftResult.lift !== null && <> — Lift: <Badge variant={liftResult.lift >= 0 ? 'success' : 'warning'}>{liftResult.lift >= 0 ? '+' : ''}{liftResult.lift}</Badge></>}
          </p>
        )}
      </div>
      <div className={styles.subSection}>
        <h4>Transactional history</h4>
        {runs.length === 0 && <p className={styles.empty}>No agent runs yet.</p>}
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Status</th><th>Tokens</th><th>By</th></tr></thead>
          <tbody>{runs.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.tokensUsed ?? '—'}</td><td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
