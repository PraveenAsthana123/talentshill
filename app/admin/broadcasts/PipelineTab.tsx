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

  const [channel, setChannel] = useState('sms');
  const [messageTemplate, setMessageTemplate] = useState("Hi {{firstName}}, we miss you at TalentsHill — reply if you'd like to reconnect.");
  const [thresholdDays, setThresholdDays] = useState('14');
  const [cooldownDays, setCooldownDays] = useState('7');
  const [triggerRunning, setTriggerRunning] = useState(false);
  const [triggerResult, setTriggerResult] = useState<{ atRiskCount: number; triggeredCount: number; skippedCount: number } | null>(null);
  const [triggerError, setTriggerError] = useState('');

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

  const runTrigger = async () => {
    if (!messageTemplate.trim()) { setTriggerError('Message template is required.'); return; }
    setTriggerRunning(true); setTriggerError(''); setTriggerResult(null);
    try {
      const res = await fetch('/api/admin/broadcasts/re-engagement/trigger/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, messageTemplate, thresholdDays: Number(thresholdDays), cooldownDays: Number(cooldownDays) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setTriggerResult({ atRiskCount: data.atRiskCount, triggeredCount: data.triggeredCount, skippedCount: data.skippedCount });
      loadRuns();
    } catch (e) { setTriggerError(String(e)); } finally { setTriggerRunning(false); }
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

      <div className={styles.subSection} style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)' }}>
        <h4>SMS/WhatsApp Event-Triggered Re-engagement (real condition, real logged messages)</h4>
        <p>Evaluates a real condition against every real <code>at_risk</code> contact: lifecycle_stage is at_risk (from the contacts module&apos;s activation pipeline), a real phone number is on file, at least the threshold days since last engagement, and not already messaged within the cooldown window. Writes a real, honestly-labeled &quot;logged&quot; message row for each eligible contact — no real SMS/WhatsApp gateway exists in this build, so nothing is actually transmitted (see Governance).</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginTop: 'var(--space-3)' }}>
          <div>
            <label className={styles.label}>Channel</label>
            <select className={styles.input} value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option value="sms">SMS</option><option value="whatsapp">WhatsApp</option>
            </select>
          </div>
          <div>
            <label className={styles.label}>Threshold (days since last engagement)</label>
            <input className={styles.input} type="number" min={0} value={thresholdDays} onChange={(e) => setThresholdDays(e.target.value)} />
          </div>
          <div>
            <label className={styles.label}>Cooldown (days between messages)</label>
            <input className={styles.input} type="number" min={0} value={cooldownDays} onChange={(e) => setCooldownDays(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <label className={styles.label}>Message template (use {'{{firstName}}'} for personalization)</label>
          <textarea className={styles.input} rows={2} value={messageTemplate} onChange={(e) => setMessageTemplate(e.target.value)} />
        </div>
        <div className={styles.formActions}><Button onClick={runTrigger} disabled={triggerRunning}>{triggerRunning ? 'Evaluating…' : 'Run Re-engagement Trigger'}</Button></div>
        {triggerError && <p className={styles.error}>{triggerError}</p>}
        {triggerResult && (
          <p>At-risk: <strong>{triggerResult.atRiskCount}</strong> · Triggered: <strong>{triggerResult.triggeredCount}</strong> · Skipped (ineligible): <strong>{triggerResult.skippedCount}</strong></p>
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
