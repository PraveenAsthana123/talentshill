'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './OccasionsShared.module.css';

interface StageResult { stage: string; input: unknown; process: string; output: unknown; status: string }
interface TriggerResult { dateKey: string; birthdaysFound: number; anniversariesFound: number; festivalsFound: number; triggered: number; skippedNoTemplate: number; skippedAlreadySent: number; stages: StageResult[] }
interface Festival { id: string; code: string; name: string; occasionDate: string; country: string | null; isActive: boolean }
interface Template { id: string; occasionType: string; festivalCode: string | null; channel: string; name: string; isActive: boolean }
interface RunEntry { id: string; status: string; triggeredBy: string | null; createdAt: string }

export default function PipelineTab() {
  const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TriggerResult | null>(null);
  const [error, setError] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [fForm, setFForm] = useState({ code: '', name: '', occasionDate: '', country: '' });
  const [fError, setFError] = useState('');

  const [templates, setTemplates] = useState<Template[]>([]);
  const [tForm, setTForm] = useState({ occasionType: 'birthday', festivalCode: '', channel: 'email', name: '', subject: '', body: 'Happy Birthday {{firstName}}! Wishing you a wonderful year ahead.' });
  const [tError, setTError] = useState('');

  const loadAll = () => {
    fetch('/api/admin/occasions/festivals/').then((r) => (r.ok ? r.json() : { festivals: [] })).then((d) => setFestivals(d.festivals || [])).catch(() => {});
    fetch('/api/admin/occasions/templates/').then((r) => (r.ok ? r.json() : { templates: [] })).then((d) => setTemplates(d.templates || [])).catch(() => {});
    fetch('/api/admin/operation-runs/?moduleKey=occasions&executionMode=pipeline&limit=20').then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { loadAll(); }, []);

  const runTrigger = async () => {
    setRunning(true); setError(''); setResult(null);
    try {
      const res = await fetch('/api/admin/occasions/trigger/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setResult(data); loadAll();
    } catch (e) { setError(String(e)); } finally { setRunning(false); }
  };

  const addFestival = async () => {
    if (!fForm.code.trim() || !fForm.name.trim() || !fForm.occasionDate) { setFError('code, name, and date are required.'); return; }
    setFError('');
    const res = await fetch('/api/admin/occasions/festivals/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: fForm.code, name: fForm.name, occasionDate: fForm.occasionDate, country: fForm.country || null }),
    });
    const data = await res.json();
    if (!res.ok) { setFError(data.error || `HTTP ${res.status}`); return; }
    setFForm({ code: '', name: '', occasionDate: '', country: '' }); loadAll();
  };

  const addTemplate = async () => {
    if (!tForm.name.trim() || !tForm.body.trim()) { setTError('name and body are required.'); return; }
    if (tForm.occasionType === 'festival' && !tForm.festivalCode.trim()) { setTError('festivalCode is required for a festival template.'); return; }
    setTError('');
    const res = await fetch('/api/admin/occasions/templates/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occasionType: tForm.occasionType, festivalCode: tForm.occasionType === 'festival' ? tForm.festivalCode : null, channel: tForm.channel, name: tForm.name, subject: tForm.channel === 'email' ? tForm.subject : null, body: tForm.body }),
    });
    const data = await res.json();
    if (!res.ok) { setTError(data.error || `HTTP ${res.status}`); return; }
    setTForm({ ...tForm, name: '', subject: '' }); loadAll();
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Real, deterministic daily scan: contacts whose real date_of_birth or customer_anniversary_date matches today, plus any active festival_calendar row dated today (matched to real contact.country, or global). For each match, the real active standard template is personalized and logged — never LLM-composed. Skips a contact already messaged for the same occasion today (real unique-index-backed dedupe), and skips silently (reported, not hidden) when no active template exists for an occasion type+channel.</p>
      </div>

      <div className={styles.subSection}>
        <h4>Run today&apos;s scan</h4>
        <label className={styles.label}>Channel</label>
        <select className={styles.input} value={channel} onChange={(e) => setChannel(e.target.value as 'email' | 'sms' | 'whatsapp')}>
          <option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option>
        </select>
        <div className={styles.formActions}><Button onClick={runTrigger} disabled={running}>{running ? 'Scanning…' : 'Run Occasion Scan'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
        {result && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            <p>Date: <strong>{result.dateKey}</strong> · Birthdays found: <strong>{result.birthdaysFound}</strong> · Anniversaries found: <strong>{result.anniversariesFound}</strong> · Festivals today: <strong>{result.festivalsFound}</strong></p>
            <p>Triggered: <strong>{result.triggered}</strong> · Skipped (no active template): <strong>{result.skippedNoTemplate}</strong> · Skipped (already sent today): <strong>{result.skippedAlreadySent}</strong></p>
            <table className={styles.table}>
              <thead><tr><th>Stage</th><th>Output</th></tr></thead>
              <tbody>{result.stages.map((s, i) => <tr key={i}><td>{s.stage}</td><td>{JSON.stringify(s.output)}</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className={styles.subSection}>
        <h4>Festival calendar</h4>
        <p>Lunar/shifting festivals (Diwali, Eid, etc.) are dated per real calendar year at entry time and must be re-added each year — not computed automatically.</p>
        <table className={styles.table}>
          <thead><tr><th>Code</th><th>Name</th><th>Date</th><th>Country</th><th>Active</th></tr></thead>
          <tbody>{festivals.map((f) => <tr key={f.id}><td>{f.code}</td><td>{f.name}</td><td>{new Date(f.occasionDate).toLocaleDateString()}</td><td>{f.country ?? 'Global'}</td><td><Badge variant={f.isActive ? 'success' : 'default'}>{f.isActive ? 'active' : 'inactive'}</Badge></td></tr>)}</tbody>
        </table>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          <input className={styles.input} placeholder="code (e.g. christmas_2026)" value={fForm.code} onChange={(e) => setFForm({ ...fForm, code: e.target.value })} />
          <input className={styles.input} placeholder="name" value={fForm.name} onChange={(e) => setFForm({ ...fForm, name: e.target.value })} />
          <input className={styles.input} type="date" value={fForm.occasionDate} onChange={(e) => setFForm({ ...fForm, occasionDate: e.target.value })} />
          <input className={styles.input} placeholder="country (blank = global)" value={fForm.country} onChange={(e) => setFForm({ ...fForm, country: e.target.value })} />
        </div>
        <div className={styles.formActions}><Button onClick={addFestival}>Add Festival</Button></div>
        {fError && <p className={styles.error}>{fError}</p>}
      </div>

      <div className={styles.subSection}>
        <h4>Standard template library</h4>
        <table className={styles.table}>
          <thead><tr><th>Name</th><th>Type</th><th>Festival</th><th>Channel</th><th>Active</th></tr></thead>
          <tbody>{templates.map((t) => <tr key={t.id}><td>{t.name}</td><td>{t.occasionType}</td><td>{t.festivalCode ?? '—'}</td><td>{t.channel}</td><td><Badge variant={t.isActive ? 'success' : 'default'}>{t.isActive ? 'active' : 'inactive'}</Badge></td></tr>)}</tbody>
        </table>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
          <select className={styles.input} value={tForm.occasionType} onChange={(e) => setTForm({ ...tForm, occasionType: e.target.value })}>
            <option value="birthday">Birthday</option><option value="anniversary">Anniversary</option><option value="festival">Festival</option>
          </select>
          <select className={styles.input} value={tForm.channel} onChange={(e) => setTForm({ ...tForm, channel: e.target.value })}>
            <option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option>
          </select>
          <input className={styles.input} placeholder="template name" value={tForm.name} onChange={(e) => setTForm({ ...tForm, name: e.target.value })} />
          {tForm.occasionType === 'festival' && <input className={styles.input} placeholder="festival code" value={tForm.festivalCode} onChange={(e) => setTForm({ ...tForm, festivalCode: e.target.value })} />}
          {tForm.channel === 'email' && <input className={styles.input} placeholder="subject" value={tForm.subject} onChange={(e) => setTForm({ ...tForm, subject: e.target.value })} />}
        </div>
        <label className={styles.label} style={{ marginTop: 'var(--space-3)' }}>Body (use {'{{firstName}}'} and {'{{years}}'})</label>
        <textarea className={styles.input} rows={3} value={tForm.body} onChange={(e) => setTForm({ ...tForm, body: e.target.value })} />
        <div className={styles.formActions}><Button onClick={addTemplate}>Add Template</Button></div>
        {tError && <p className={styles.error}>{tError}</p>}
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
