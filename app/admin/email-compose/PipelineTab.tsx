'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './ComposeShared.module.css';

interface EmailProfile { id: string; name: string; fromEmail: string; }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }

export default function PipelineTab() {
  const [profiles, setProfiles] = useState<EmailProfile[]>([]);
  const [form, setForm] = useState({ to: '', subject: '', html: '', profileId: '' });
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=email_compose&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/email-profiles').then((r) => (r.ok ? r.json() : { profiles: [] }))
      .then((d) => setProfiles(d.profiles || [])).catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!form.to || !form.subject || !form.html) { setError('Fill in To, Subject, and HTML first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/email-compose/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
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
        <p>Score a draft email&apos;s real pre-send readiness — recipient format, subject/html substance, and whether a specific sender profile is explicitly selected. Compose has no persisted draft entity, so each run inserts a new row into the real <code>email_compose_log</code> table (audit trail) instead of updating a record in place.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <input placeholder="To (email)" value={form.to} onChange={(e) => setForm((p) => ({ ...p, to: e.target.value }))} style={{ width: '100%', marginBottom: 'var(--space-3)', padding: 'var(--space-2)' }} />
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} style={{ width: '100%', marginBottom: 'var(--space-3)', padding: 'var(--space-2)' }} />
        <textarea placeholder="HTML content" value={form.html} onChange={(e) => setForm((p) => ({ ...p, html: e.target.value }))} style={{ width: '100%', marginBottom: 'var(--space-3)', padding: 'var(--space-2)', minHeight: '80px' }} />
        <Select label="Sender profile" options={profiles.map((p) => ({ value: p.id, label: `${p.name} (${p.fromEmail})` }))} placeholder="Default Profile" value={form.profileId} onChange={(e) => setForm((p) => ({ ...p, profileId: e.target.value }))} />
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
