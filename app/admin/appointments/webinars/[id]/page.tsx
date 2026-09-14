'use client';

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui';
import styles from './AdminWebinar.module.css';

interface Registrant {
  id: string; fullName: string; email: string; company: string | null;
  attended: boolean | null; engagementNotes: string | null;
  qualificationScore: number | null; qualificationTier: string | null; contactSubmissionId: string | null;
}
interface PipelineLinkedEntry { registrantId: string; contactSubmissionId: string; created: boolean; qualificationStage: string }
interface ConversionResult { registrantCount: number; attendedCount: number; qualifiedCount: number; pipelineLinked: PipelineLinkedEntry[] }
interface RecapResult { summary: string | null; fabricationWarning: boolean; conversion: ConversionResult }

export default function WebinarDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [webinar, setWebinar] = useState<any>(null);
  const [registrants, setRegistrants] = useState<Registrant[]>([]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', company: '', consent: false });

  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, { attended: boolean; engagementNotes: string }>>({});

  const [converting, setConverting] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [recapping, setRecapping] = useState(false);
  const [recapResult, setRecapResult] = useState<RecapResult | null>(null);
  const [error, setError] = useState('');

  const loadData = () => {
    fetch(`/api/admin/appointments/webinars/${id}`).then((r) => r.json()).then((d) => {
      setWebinar(d.webinar);
      setRegistrants(d.registrants || []);
    });
  };

  useEffect(() => { loadData(); }, [id]);

  const addRegistrant = async () => {
    if (!form.fullName.trim() || !form.email.trim()) return;
    await fetch(`/api/admin/appointments/webinars/${id}/registrants`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName: form.fullName.trim(), email: form.email.trim(), company: form.company.trim() || undefined, consent: form.consent }),
    });
    setForm({ fullName: '', email: '', company: '', consent: false });
    setShowAddForm(false);
    loadData();
  };

  const saveAttendance = async (registrantId: string) => {
    const draft = attendanceDraft[registrantId];
    if (!draft) return;
    await fetch(`/api/admin/appointments/registrants/${registrantId}/attendance`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attended: draft.attended, engagementNotes: draft.engagementNotes }),
    });
    loadData();
  };

  const runConversion = async () => {
    setConverting(true); setError(''); setConversionResult(null);
    try {
      const res = await fetch(`/api/admin/appointments/webinars/${id}/convert`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setConversionResult(data);
      loadData();
    } catch (e) { setError(String(e)); } finally { setConverting(false); }
  };

  const runRecap = async () => {
    setRecapping(true); setError(''); setRecapResult(null);
    try {
      const res = await fetch(`/api/admin/appointments/webinars/${id}/recap`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setRecapResult(data);
      loadData();
    } catch (e) { setError(String(e)); } finally { setRecapping(false); }
  };

  if (!webinar) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{webinar.title}</h1>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Topic</span><span>{webinar.topic}</span></div>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Status</span><span>{webinar.status}</span></div>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Scheduled</span><span>{new Date(webinar.scheduledAt).toLocaleString()}</span></div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Registrants ({registrants.length})</h2>
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={() => setShowAddForm((v) => !v)}>{showAddForm ? 'Cancel' : 'Add Registrant'}</button>
        </div>
        {showAddForm && (
          <div className={styles.formCard}>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Full name</label><input className={styles.formInput} value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Email</label><input className={styles.formInput} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Company (optional)</label><input className={styles.formInput} value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} /></div>
              <div>
                <label className={styles.formLabel}>Consent</label>
                <select className={styles.formInput} value={form.consent ? 'yes' : 'no'} onChange={(e) => setForm((p) => ({ ...p, consent: e.target.value === 'yes' }))}>
                  <option value="no">No</option><option value="yes">Yes</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <button className={styles.btnPrimary} onClick={addRegistrant} disabled={!form.fullName.trim() || !form.email.trim()}>Add</button>
            </div>
          </div>
        )}

        {registrants.length === 0 ? <p className={styles.empty}>No registrants yet.</p> : (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Email</th><th>Attended</th><th>Engagement Notes (real, admin-entered)</th><th>Qualification</th><th></th></tr></thead>
            <tbody>
              {registrants.map((r) => {
                const draft = attendanceDraft[r.id] ?? { attended: r.attended ?? false, engagementNotes: r.engagementNotes ?? '' };
                return (
                  <tr key={r.id}>
                    <td>{r.fullName}</td>
                    <td>{r.email}</td>
                    <td>
                      <select className={styles.formInput} value={draft.attended ? 'yes' : 'no'} onChange={(e) => setAttendanceDraft((p) => ({ ...p, [r.id]: { ...draft, attended: e.target.value === 'yes' } }))}>
                        <option value="no">No</option><option value="yes">Yes</option>
                      </select>
                    </td>
                    <td>
                      <input className={styles.formInput} value={draft.engagementNotes} placeholder="e.g. asked pricing question, requested demo"
                        onChange={(e) => setAttendanceDraft((p) => ({ ...p, [r.id]: { ...draft, engagementNotes: e.target.value } }))} />
                    </td>
                    <td>{r.qualificationTier ? <Badge variant={r.qualificationTier === 'hot' ? 'error' : r.qualificationTier === 'warm' ? 'warning' : 'default'}>{r.qualificationTier} ({r.qualificationScore})</Badge> : '—'}</td>
                    <td><button className={styles.btnSecondary} onClick={() => saveAttendance(r.id)}>Save</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Webinar-to-Pipeline Conversion</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Scores every real registrant by real attendance + real engagement notes, then creates or promotes a real
          row in the leads pipeline (contact_submissions) for every real warm-or-hot registrant.
        </p>
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={runConversion} disabled={converting}>{converting ? 'Scoring…' : 'Run Conversion'}</button>
          <button className={styles.btnSecondary} onClick={runRecap} disabled={recapping}>{recapping ? 'Agent running (30-60s)…' : 'Generate AI Recap'}</button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {conversionResult && (
          <div className={styles.card}>
            <strong>Registered: {conversionResult.registrantCount} · Attended: {conversionResult.attendedCount} · Qualified: {conversionResult.qualifiedCount}</strong>
            {conversionResult.pipelineLinked.length > 0 && (
              <ul>
                {conversionResult.pipelineLinked.map((p, i) => (
                  <li key={i} style={{ fontSize: 'var(--font-size-sm)' }}>{p.created ? 'Created' : 'Promoted'} lead — stage: {p.qualificationStage}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        {recapResult?.summary && (
          <div className={styles.card}>
            <div className={styles.cardHeader}><strong>AI Recap</strong>{recapResult.fabricationWarning && <Badge variant="warning">possible fabrication — verify</Badge>}</div>
            <div className={styles.field}>{recapResult.summary}</div>
          </div>
        )}
      </div>
    </div>
  );
}
