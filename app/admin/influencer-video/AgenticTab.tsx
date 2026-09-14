'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './InfluencerVideoShared.module.css';

interface CampaignOption { id: string; influencerName: string; status: string }
interface StepRecord { phase: string; agentRole: string; input: string; output: string; tokensUsed: number }
interface RunEntry { id: string; status: string; tokensUsed: number | null; createdAt: string; triggeredBy: string | null }

export default function AgenticTab() {
  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [campaignId, setCampaignId] = useState('');
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<StepRecord[] | null>(null);
  const [totalTokens, setTotalTokens] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [roiRunning, setRoiRunning] = useState(false);
  const [roiNarrative, setRoiNarrative] = useState('');
  const [roiError, setRoiError] = useState('');

  const [sentimentCampaignId, setSentimentCampaignId] = useState('');
  const [sentimentRunning, setSentimentRunning] = useState(false);
  const [sentiment, setSentiment] = useState<{ sentiment: string; explanation: string } | null>(null);
  const [sentimentError, setSentimentError] = useState('');

  const runRoiAgent = async () => {
    setRoiRunning(true); setRoiError(''); setRoiNarrative('');
    try {
      const res = await fetch('/api/admin/influencer-video/roi-scoring/agentic/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setRoiNarrative(data.narrative || '');
      loadRuns();
    } catch (e) { setRoiError(String(e)); } finally { setRoiRunning(false); }
  };

  const runSentimentAgent = async () => {
    if (!sentimentCampaignId) { setSentimentError('Select a campaign first.'); return; }
    setSentimentRunning(true); setSentimentError(''); setSentiment(null);
    try {
      const res = await fetch(`/api/admin/influencer-video/${sentimentCampaignId}/sentiment/`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSentiment({ sentiment: data.sentiment, explanation: data.explanation });
      loadRuns();
    } catch (e) { setSentimentError(String(e)); } finally { setSentimentRunning(false); }
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=influencer_video&executionMode=agentic&limit=20')
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
    setRunning(true); setError(''); setSteps(null);
    try {
      const res = await fetch('/api/admin/influencer-video/agentic/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId }),
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
        <p>Reuses the real readiness pipeline as its &quot;search&quot; step, then drafts a real LLM-written recommendation — local Ollama (phi4-mini), 1 agent (&quot;influencer_campaign_readiness_advisor&quot;). Advisory only.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Campaign" options={campaigns.map((c) => ({ value: c.id, label: `${c.influencerName} (${c.status})` }))} placeholder="Select a campaign..." value={campaignId} onChange={(e) => setCampaignId(e.target.value)} />
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
        <h4>Creator ROI narrative (cross-creator, Ollama)</h4>
        <p>Runs the deterministic ROI pipeline, then asks the local model to turn the real per-creator numbers into a short prioritized renewal narrative.</p>
        <div className={styles.formActions}><Button onClick={runRoiAgent} disabled={roiRunning}>{roiRunning ? 'Agent running (30-60s)…' : 'Run ROI Agent'}</Button></div>
        {roiError && <p className={styles.error}>{roiError}</p>}
        {roiNarrative && <div className={styles.card}><p>{roiNarrative}</p></div>}
      </div>
      <div className={styles.subSection}>
        <h4>Sentiment analysis (real feedback text, Ollama)</h4>
        <p>Classifies sentiment from real, admin-entered campaign feedback notes (Manual tab). Reports &quot;insufficient data&quot; honestly if no feedback has been logged — never invents a score.</p>
        <Select label="Campaign" options={campaigns.map((c) => ({ value: c.id, label: `${c.influencerName} (${c.status})` }))} placeholder="Select a campaign..." value={sentimentCampaignId} onChange={(e) => setSentimentCampaignId(e.target.value)} />
        <div className={styles.formActions}><Button onClick={runSentimentAgent} disabled={sentimentRunning}>{sentimentRunning ? 'Analyzing…' : 'Run Sentiment Analysis'}</Button></div>
        {sentimentError && <p className={styles.error}>{sentimentError}</p>}
        {sentiment && (
          <div className={styles.card}>
            <Badge variant={sentiment.sentiment === 'positive' ? 'success' : sentiment.sentiment === 'negative' ? 'warning' : 'default'}>{sentiment.sentiment}</Badge>
            <p>{sentiment.explanation}</p>
          </div>
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
