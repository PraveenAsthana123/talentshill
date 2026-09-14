'use client';

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui';
import styles from './AdminCompetitorObservations.module.css';

interface Observation {
  id: string; observedAt: string; channel: string; campaignType: string; description: string; evidenceUrl: string | null;
}
interface NarrativeResult { narrative: string | null; fabricationWarning: boolean; observationCount: number }

const CHANNELS = ['paid_social', 'search', 'email', 'landing_page', 'organic_social', 'pr', 'other'];
const CAMPAIGN_TYPES = ['promotion', 'new_creative', 'pricing_change', 'messaging_shift', 'product_launch', 'other'];

export default function CompetitorObservationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [competitor, setCompetitor] = useState<any>(null);
  const [observations, setObservations] = useState<Observation[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ observedAt: new Date().toISOString().slice(0, 10), channel: 'paid_social', campaignType: 'promotion', description: '', evidenceUrl: '' });

  const [narrativeRunning, setNarrativeRunning] = useState(false);
  const [narrativeResult, setNarrativeResult] = useState<NarrativeResult | null>(null);
  const [error, setError] = useState('');

  const loadData = () => {
    fetch(`/api/admin/competitor-analysis/${id}`).then((r) => r.json()).then((d) => setCompetitor(d.entry ?? d));
    fetch(`/api/admin/competitor-analysis/${id}/observations`).then((r) => r.json()).then((d) => setObservations(d.items || []));
  };

  useEffect(() => { loadData(); }, [id]);

  const addObservation = async () => {
    if (!form.observedAt || !form.description.trim()) return;
    await fetch(`/api/admin/competitor-analysis/${id}/observations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        observedAt: form.observedAt, channel: form.channel, campaignType: form.campaignType,
        description: form.description.trim(), evidenceUrl: form.evidenceUrl.trim() || undefined,
      }),
    });
    setForm({ observedAt: new Date().toISOString().slice(0, 10), channel: 'paid_social', campaignType: 'promotion', description: '', evidenceUrl: '' });
    setShowForm(false);
    loadData();
  };

  const deleteObservation = async (obsId: string) => {
    if (!confirm('Delete this observation?')) return;
    await fetch(`/api/admin/competitor-analysis/observations/${obsId}`, { method: 'DELETE' });
    loadData();
  };

  const runNarrative = async () => {
    setNarrativeRunning(true); setError(''); setNarrativeResult(null);
    try {
      const res = await fetch(`/api/admin/competitor-analysis/${id}/narrative`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setNarrativeResult(data);
    } catch (e) { setError(String(e)); } finally { setNarrativeRunning(false); }
  };

  if (!competitor) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{competitor.competitorName} — Campaign Observations</h1>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)' }}>
        Real, admin-entered observations of publicly visible activity. No scraping/ad-library integration exists in this build.
      </p>

      <div className={styles.section}>
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'Log Observation'}</button>
          <button className={styles.btnSecondary} onClick={runNarrative} disabled={narrativeRunning}>{narrativeRunning ? 'Agent running (30-60s)…' : 'Generate AI Narrative'}</button>
        </div>
        {error && <p className={styles.error}>{error}</p>}

        {showForm && (
          <div className={styles.formCard}>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Observed date</label><input className={styles.formInput} type="date" value={form.observedAt} onChange={(e) => setForm((p) => ({ ...p, observedAt: e.target.value }))} /></div>
              <div>
                <label className={styles.formLabel}>Channel</label>
                <select className={styles.formInput} value={form.channel} onChange={(e) => setForm((p) => ({ ...p, channel: e.target.value }))}>
                  {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={styles.formLabel}>Campaign type</label>
                <select className={styles.formInput} value={form.campaignType} onChange={(e) => setForm((p) => ({ ...p, campaignType: e.target.value }))}>
                  {CAMPAIGN_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label className={styles.formLabel}>Evidence URL (optional)</label><input className={styles.formInput} value={form.evidenceUrl} onChange={(e) => setForm((p) => ({ ...p, evidenceUrl: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <label className={styles.formLabel}>Description (what was actually observed)</label>
              <textarea className={styles.formInput} rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <button className={styles.btnPrimary} onClick={addObservation} disabled={!form.observedAt || !form.description.trim()}>Log Observation</button>
            </div>
          </div>
        )}

        {narrativeResult?.narrative && (
          <div className={styles.card}>
            <div className={styles.cardHeader}><strong>AI Activity Summary</strong>{narrativeResult.fabricationWarning && <Badge variant="warning">possible fabrication — verify</Badge>}</div>
            <div className={styles.field}>{narrativeResult.narrative}</div>
          </div>
        )}

        {observations.length === 0 ? <p className={styles.empty}>No observations logged yet.</p> : (
          <table className={styles.table}>
            <thead><tr><th>Date</th><th>Channel</th><th>Type</th><th>Description</th><th></th></tr></thead>
            <tbody>
              {observations.map((o) => (
                <tr key={o.id}>
                  <td>{new Date(o.observedAt).toLocaleDateString()}</td>
                  <td>{o.channel}</td>
                  <td>{o.campaignType}</td>
                  <td>{o.description}</td>
                  <td><button className={styles.btnSecondary} onClick={() => deleteObservation(o.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
