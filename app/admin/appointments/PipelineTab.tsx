'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import { Select } from '@/components/ui/Input';
import styles from './AppointmentsShared.module.css';

interface AppointmentOption { id: string; contact: { name: string; company: string } }
interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface RunEntry { id: string; status: string; createdAt: string; triggeredBy: string | null }

export default function PipelineTab() {
  const [appointments, setAppointments] = useState<AppointmentOption[]>([]);
  const [appointmentId, setAppointmentId] = useState('');
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<StageResult[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [error, setError] = useState('');

  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=appointments&executionMode=pipeline&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };

  useEffect(() => {
    fetch('/api/admin/appointments/').then((r) => (r.ok ? r.json() : { appointments: [] }))
      .then((d) => setAppointments((d.appointments || []).map((a: { id: string; contact: { name: string; company: string } }) => ({ id: a.id, contact: a.contact }))))
      .catch(() => {});
    loadRuns();
  }, []);

  const run = async () => {
    if (!appointmentId) { setError('Select a booking first.'); return; }
    setRunning(true); setError(''); setStages(null);
    try {
      const res = await fetch('/api/admin/appointments/pipeline/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId }),
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
        <p>Compute a real follow-up urgency score (distinct from the booking-time lead score) grounded in the booking&apos;s current status, tier, and staleness — writes to the real, previously-unused <code>appointments.followUpUrgency</code> field.</p>
      </div>
      <div className={styles.subSection}>
        <h4>Input</h4>
        <Select label="Booking" options={appointments.map((a) => ({ value: a.id, label: `${a.contact.name} (${a.contact.company})` }))} placeholder="Select a booking..." value={appointmentId} onChange={(e) => setAppointmentId(e.target.value)} />
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
