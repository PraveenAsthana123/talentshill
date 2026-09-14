'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './ContactsShared.module.css';

interface ContactOption { id: string; email: string; company: string | null }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }
interface LifecycleByStage { new: number; engaged: number; at_risk: number; churned: number }

export default function PipelineTab() {
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [contactId, setContactId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const [activationRunning, setActivationRunning] = useState(false);
  const [byStage, setByStage] = useState<LifecycleByStage | null>(null);
  const [activationError, setActivationError] = useState('');
  const [segmenting, setSegmenting] = useState(false);
  const [segmentResult, setSegmentResult] = useState('');

  const runActivationScoring = async () => {
    setActivationRunning(true); setActivationError(''); setByStage(null);
    try {
      const res = await fetch('/api/admin/contacts/activation-scoring/', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setByStage(data.byStage);
      loadRuns();
    } catch (e) { setActivationError(String(e)); } finally { setActivationRunning(false); }
  };

  const runRetentionSegmentation = async () => {
    setSegmenting(true); setSegmentResult('');
    try {
      const res = await fetch('/api/admin/contacts/retention-segmentation/', { method: 'POST' });
      const data = await res.json();
      setSegmentResult(data.retentionListId
        ? `${data.atRiskCount} at-risk contact(s) segmented into a new retention list.`
        : `${data.atRiskCount} at-risk contact(s) -- no list created.`);
    } catch (e) { setSegmentResult(String(e)); } finally { setSegmenting(false); }
  };

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=contacts&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/contacts/?limit=100').then((r) => (r.ok ? r.json() : { contacts: [] }))
      .then((d) => setContacts((d.contacts || []).map((c: { id: string; email: string; company: string | null }) => ({ id: c.id, email: c.email, company: c.company }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!contactId) { setError('Select a contact first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/contacts/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId }),
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
        <p>Score a contact&apos;s data-quality + engagement potential deterministically using a real rubric grounded in actually-present fields (name, company, phone, tags, source, status) — writes to the real, previously-unused <code>contacts.leadScore</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Contact" options={contacts.map((c) => ({ value: c.id, label: `${c.email}${c.company ? ` (${c.company})` : ''}` }))} placeholder="Select a contact..." value={contactId} onChange={(e) => setContactId(e.target.value)} />
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
        <h4>Lifecycle &amp; activation scoring (behavioral, cross-campaign, all contacts)</h4>
        <p>Distinct from the completeness score above: computes each contact&apos;s real lifecycle stage (new / engaged / at_risk / churned) and a 0-100 activation score from real cross-campaign email open/click history (<code>campaign_recipients</code>), never from profile fields. Writes <code>contacts.lifecycle_stage</code>/<code>activation_score</code>/<code>last_engaged_at</code> for every contact.</p>
        <div className={styles.formActions}><Button onClick={runActivationScoring} disabled={activationRunning}>{activationRunning ? 'Scoring…' : 'Run Activation Scoring (all contacts)'}</Button></div>
        {activationError && <p className={styles.error}>{activationError}</p>}
        {byStage && (
          <table className={styles.table}>
            <thead><tr><th>New</th><th>Engaged</th><th>At Risk</th><th>Churned</th></tr></thead>
            <tbody><tr><td>{byStage.new}</td><td>{byStage.engaged}</td><td>{byStage.at_risk}</td><td>{byStage.churned}</td></tr></tbody>
          </table>
        )}
        <div className={styles.formActions} style={{ marginTop: 'var(--space-3)' }}><Button onClick={runRetentionSegmentation} disabled={segmenting}>{segmenting ? 'Segmenting…' : 'Segment At-Risk Contacts for Retention'}</Button></div>
        {segmentResult && <p>{segmentResult}</p>}
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
