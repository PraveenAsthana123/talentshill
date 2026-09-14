'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminVoiceAi.module.css';
import sharedStyles from './VoiceAiShared.module.css';

interface Asset { id: string; title: string; type: string; status: string; content: string | null; readinessScore: number | null; createdAt: string }
interface CallLog { id: string; direction: string; phoneNumber: string | null; callDate: string; durationSeconds: number | null; qualificationScore: number | null; qualificationTier: string | null; contactId: string | null }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const TYPES = ['script', 'recording', 'transcript'];
type Tab = 'assets' | 'calls';

export default function ManualTab() {
  const [tab, setTab] = useState<Tab>('assets');
  const [items, setItems] = useState<Asset[]>([]);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('script');
  const [content, setContent] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const [showCallForm, setShowCallForm] = useState(false);
  const [direction, setDirection] = useState('outbound');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [transcript, setTranscript] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/voice-ai'); const data = await res.json(); setItems(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const fetchCalls = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/voice-ai/calls'); const data = await res.json(); setCalls(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=voice_ai&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { if (tab === 'assets') fetchItems(); else fetchCalls(); loadRuns(); }, [tab]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await fetch('/api/admin/voice-ai', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), type, content: content.trim() || undefined }),
    });
    setTitle(''); setContent(''); setShowForm(false);
    fetchItems(); loadRuns();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    await fetch(`/api/admin/voice-ai/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  const handleLogCall = async () => {
    if (!transcript.trim()) return;
    await fetch('/api/admin/voice-ai/calls', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        direction, transcript: transcript.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        durationSeconds: durationSeconds ? Number(durationSeconds) : undefined,
      }),
    });
    setPhoneNumber(''); setTranscript(''); setDurationSeconds(''); setShowCallForm(false);
    fetchCalls(); loadRuns();
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Track voice scripts, recordings, and transcripts (real local CRUD) plus real, admin-entered call logs for lead qualification. No telephony integration exists (no Twilio/IVR) — call transcripts are manually entered text describing what was actually said, same honesty pattern as branding&apos;s brand mentions. See Governance.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Add real script text or upload a recording&apos;s file path before running readiness scoring</li><li>Log a real call transcript before running Qualification or the AI summary</li></ul>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === 'assets' ? styles.tabActive : ''}`} onClick={() => setTab('assets')}>Assets</button>
        <button className={`${styles.tab} ${tab === 'calls' ? styles.tabActive : ''}`} onClick={() => setTab('calls')}>Calls</button>
      </div>

      {tab === 'assets' && (
        <>
          <div className={styles.toolbar}>
            <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Asset'}</Button>
          </div>

          {showForm && (
            <div className={styles.formCard}>
              <div className={styles.formGrid}>
                <div><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div><label className={styles.formLabel}>Type</label>
                  <select className={styles.formInput} value={type} onChange={(e) => setType(e.target.value)}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <label className={styles.formLabel}>Content (script/transcript text)</label>
                <textarea className={styles.formInput} rows={3} value={content} onChange={(e) => setContent(e.target.value)} />
              </div>
              <div className={styles.formActions}><Button onClick={handleCreate} disabled={!title.trim()}>Create Asset</Button></div>
            </div>
          )}

          <div className={styles.tableWrap}>
            {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No assets yet.</div> : (
              <table className={styles.table}>
                <thead><tr><th>Title</th><th>Type</th><th>Status</th><th>Readiness</th><th>Actions</th></tr></thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id}>
                      <td className={styles.nameCell}>{a.title}</td>
                      <td>{a.type}</td>
                      <td><Badge variant={a.status === 'approved' ? 'success' : 'default'}>{a.status}</Badge></td>
                      <td>{a.readinessScore ?? '—'}</td>
                      <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(a.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'calls' && (
        <>
          <div className={styles.toolbar}>
            <Button size="sm" onClick={() => setShowCallForm((v) => !v)}>{showCallForm ? 'Cancel' : 'Log Call'}</Button>
          </div>

          {showCallForm && (
            <div className={styles.formCard}>
              <div className={styles.formGrid}>
                <div><label className={styles.formLabel}>Direction</label>
                  <select className={styles.formInput} value={direction} onChange={(e) => setDirection(e.target.value)}>
                    <option value="outbound">Outbound</option><option value="inbound">Inbound</option>
                  </select>
                </div>
                <div><label className={styles.formLabel}>Phone number</label><input className={styles.formInput} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="e.g. +1 555 0100" /></div>
                <div><label className={styles.formLabel}>Duration (seconds)</label><input className={styles.formInput} type="number" min={0} value={durationSeconds} onChange={(e) => setDurationSeconds(e.target.value)} /></div>
              </div>
              <div style={{ marginTop: 'var(--space-4)' }}>
                <label className={styles.formLabel}>Transcript (real, what was actually said on the call)</label>
                <textarea className={styles.formInput} rows={5} value={transcript} onChange={(e) => setTranscript(e.target.value)} />
              </div>
              <div className={styles.formActions}><Button onClick={handleLogCall} disabled={!transcript.trim()}>Log Call</Button></div>
            </div>
          )}

          <div className={styles.tableWrap}>
            {loading ? <div className={styles.empty}>Loading...</div> : calls.length === 0 ? <div className={styles.empty}>No calls logged yet.</div> : (
              <table className={styles.table}>
                <thead><tr><th>Direction</th><th>Phone</th><th>Date</th><th>Qualification</th><th></th></tr></thead>
                <tbody>
                  {calls.map((c) => (
                    <tr key={c.id}>
                      <td className={styles.nameCell}>{c.direction}</td>
                      <td>{c.phoneNumber || '—'}</td>
                      <td>{new Date(c.callDate).toLocaleString()}</td>
                      <td>{c.qualificationTier ? <Badge variant={c.qualificationTier === 'hot' ? 'error' : c.qualificationTier === 'warm' ? 'warning' : 'default'}>{c.qualificationTier} ({c.qualificationScore})</Badge> : '—'}</td>
                      <td><Link href={`/admin/voice-ai/calls/${c.id}`} className={styles.link}>View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      <div className={sharedStyles.subSection} style={{ marginTop: 'var(--space-6)' }}>
        <h4>Transactional history</h4>
        {runs.length === 0 && <p className={sharedStyles.empty}>No manual operations logged yet.</p>}
        <table className={sharedStyles.table}>
          <thead><tr><th>When</th><th>Operation</th><th>Status</th><th>By</th></tr></thead>
          <tbody>{runs.map((r) => <tr key={r.id}><td>{new Date(r.createdAt).toLocaleString()}</td><td>{r.operationName}</td><td><Badge variant={r.status === 'completed' ? 'success' : 'warning'}>{r.status}</Badge></td><td>{r.triggeredBy ? r.triggeredBy.slice(0, 8) : 'system'}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
