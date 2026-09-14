'use client';

import { useState, useEffect, use } from 'react';
import styles from './AdminVoiceCall.module.css';

interface Signal { key: string; label: string; detected: boolean; matchedText: string | null }
interface QualificationResult { score: number; tier: 'cold' | 'warm' | 'hot' | null; signals: Signal[]; contactId: string | null; contactCreated: boolean }
interface SummaryResult { summary: string | null; fabricationWarning: boolean; qualification: { score: number; tier: string | null } }

export default function VoiceCallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [call, setCall] = useState<any>(null);

  const [qualifying, setQualifying] = useState(false);
  const [qualResult, setQualResult] = useState<QualificationResult | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);
  const [error, setError] = useState('');

  const loadData = () => {
    fetch(`/api/admin/voice-ai/calls/${id}`).then(r => r.json()).then(d => setCall(d.call));
  };

  useEffect(() => { loadData(); }, [id]);

  const runQualification = async () => {
    setQualifying(true); setError('');
    try {
      const res = await fetch(`/api/admin/voice-ai/calls/${id}/qualify`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setQualResult(data);
      loadData();
    } catch (e) { setError(String(e)); } finally { setQualifying(false); }
  };

  const runSummary = async () => {
    setSummarizing(true); setError('');
    try {
      const res = await fetch(`/api/admin/voice-ai/calls/${id}/summarize`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSummaryResult(data);
      loadData();
    } catch (e) { setError(String(e)); } finally { setSummarizing(false); }
  };

  if (!call) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Call: {call.direction} {call.phoneNumber ? `(${call.phoneNumber})` : ''}</h1>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Direction</span><span>{call.direction}</span></div>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Duration</span><span>{call.durationSeconds ? `${call.durationSeconds}s` : '—'}</span></div>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Call Date</span><span>{new Date(call.callDate).toLocaleString()}</span></div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Transcript (real, admin-entered)</h2>
        <div className={styles.transcriptBox}>{call.transcript}</div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>AI Lead Qualification</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
          Scores real BANT-style buying signals detected in this transcript (never LLM-estimated). A hot
          score with a real email in the transcript links or creates a contact automatically.
        </p>
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={runQualification} disabled={qualifying}>{qualifying ? 'Scoring…' : 'Run Qualification'}</button>
          <button className={styles.btnSecondary} onClick={runSummary} disabled={summarizing}>{summarizing ? 'Agent running (30-60s)…' : 'Generate AI Summary'}</button>
        </div>
        {error && <p className={styles.error}>{error}</p>}

        {(call.qualificationTier || qualResult) && (
          <div className={styles.qualBox}>
            <strong>Qualification: {(qualResult?.tier ?? call.qualificationTier)} ({qualResult?.score ?? call.qualificationScore}/100)</strong>
            {qualResult && (
              <ul className={styles.signalList}>
                {qualResult.signals.map((s) => (
                  <li key={s.key} className={s.detected ? styles.signalHit : styles.signalMiss}>
                    {s.detected ? '✓' : '—'} {s.label}
                  </li>
                ))}
              </ul>
            )}
            {qualResult?.contactId && (
              <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-sm)' }}>
                {qualResult.contactCreated ? 'New contact created' : 'Linked to existing contact'} from this call.
              </p>
            )}
          </div>
        )}

        {summaryResult?.summary && (
          <div className={styles.summaryBox}>{summaryResult.summary}</div>
        )}
      </div>
    </div>
  );
}
