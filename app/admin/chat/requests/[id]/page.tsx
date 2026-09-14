'use client';

import { useState, useEffect, use } from 'react';
import styles from './AdminChatRequest.module.css';

const STATUS_FLOW = ['new', 'triaged', 'responding', 'waiting_user', 'resolved', 'closed'];

interface Message { id: string; role: string; content: string; createdAt: string }
interface Signal { key: string; label: string; detected: boolean; matchedText: string | null }
interface QualificationResult { score: number; tier: 'cold' | 'warm' | 'hot' | null; signals: Signal[]; contactId: string | null; contactCreated: boolean }
interface DraftReplyResult { draftReply: string | null; fabricationWarning: boolean; qualification: { score: number; tier: string | null } }

export default function ChatRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [req, setReq] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);

  const [qualifying, setQualifying] = useState(false);
  const [qualResult, setQualResult] = useState<QualificationResult | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState<DraftReplyResult | null>(null);
  const [aiError, setAiError] = useState('');

  const loadData = () => {
    fetch(`/api/admin/chat/requests/${id}`).then(r => r.json()).then(setReq);
    fetch(`/api/admin/chat/requests/${id}/notes`).then(r => r.json()).then(setNotes);
    fetch(`/api/admin/chat/requests/${id}/messages`).then(r => r.json()).then(d => setMessages(d.messages || []));
  };

  useEffect(() => { loadData(); }, [id]);

  const updateStatus = async (status: string) => {
    await fetch(`/api/admin/chat/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const sendResponse = async () => {
    if (!response.trim()) return;
    setSending(true);
    await fetch(`/api/admin/chat/requests/${id}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: response }),
    });
    setResponse('');
    setSending(false);
    loadData();
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    await fetch(`/api/admin/chat/requests/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newNote }),
    });
    setNewNote('');
    loadData();
  };

  const runQualification = async () => {
    setQualifying(true); setAiError('');
    try {
      const res = await fetch(`/api/admin/chat/requests/${id}/qualify`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setQualResult(data);
      loadData();
    } catch (e) { setAiError(String(e)); } finally { setQualifying(false); }
  };

  const runDraftReply = async () => {
    setDrafting(true); setAiError('');
    try {
      const res = await fetch(`/api/admin/chat/requests/${id}/draft-reply`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setDraftResult(data);
      loadData();
    } catch (e) { setAiError(String(e)); } finally { setDrafting(false); }
  };

  const useDraftAsResponse = () => {
    if (draftResult?.draftReply) setResponse(draftResult.draftReply);
  };

  if (!req) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Request: {req.subject || 'No subject'}</h1>

      <div className={styles.statusRow}>
        {STATUS_FLOW.map(s => (
          <button key={s} className={`${styles.statusBtn} ${req.status === s ? styles.statusActive : ''}`} onClick={() => updateStatus(s)}>
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Priority</span><span>{req.priority}</span></div>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Category</span><span>{req.category || '-'}</span></div>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Created</span><span>{new Date(req.createdAt).toLocaleString()}</span></div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Conversation</h2>
        <div className={styles.transcript}>
          {messages.length === 0 && <p className={styles.empty}>No messages yet.</p>}
          {messages.map((m) => (
            <div key={m.id} className={m.role === 'user' ? styles.msgUser : styles.msgAssistant}>
              <span className={styles.msgRole}>{m.role}</span>
              {m.content}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>AI Sales Qualification &amp; Draft Reply</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
          Scores real keyword-detected buying signals in this conversation (never LLM-estimated). A hot
          score with a real visitor email links or creates a contact automatically.
        </p>
        <div className={styles.statusRow}>
          <button className={styles.btnPrimary} onClick={runQualification} disabled={qualifying}>{qualifying ? 'Scoring…' : 'Run Qualification'}</button>
          <button className={styles.btnSecondary} onClick={runDraftReply} disabled={drafting}>{drafting ? 'Agent running (30-60s)…' : 'Draft AI Reply'}</button>
        </div>
        {aiError && <p style={{ color: 'crimson', fontSize: 'var(--font-size-sm)' }}>{aiError}</p>}

        {(req.qualificationTier || qualResult) && (
          <div className={styles.qualBox}>
            <strong>Qualification: {(qualResult?.tier ?? req.qualificationTier)} ({qualResult?.score ?? req.qualificationScore}/100)</strong>
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
                {qualResult.contactCreated ? 'New contact created' : 'Linked to existing contact'} from this conversation.
              </p>
            )}
          </div>
        )}

        {draftResult?.draftReply && (
          <div>
            <div className={styles.draftBox}>{draftResult.draftReply}</div>
            <div className={styles.statusRow} style={{ marginTop: 'var(--space-2)' }}>
              <button className={styles.btnSecondary} onClick={useDraftAsResponse}>Use as Response</button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Respond</h2>
        <textarea className={styles.textarea} value={response} onChange={e => setResponse(e.target.value)} placeholder="Type your response..." rows={4} />
        <button className={styles.btnPrimary} onClick={sendResponse} disabled={sending || !response.trim()}>
          {sending ? 'Sending...' : 'Send Response'}
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notes</h2>
        <div className={styles.notesList}>
          {notes.map((n: any) => (
            <div key={n.id} className={styles.noteItem}>
              <p className={styles.noteContent}>{n.content}</p>
              <span className={styles.noteTime}>{new Date(n.createdAt).toLocaleString()}</span>
            </div>
          ))}
          {notes.length === 0 && <p className={styles.empty}>No notes yet</p>}
        </div>
        <div className={styles.addNoteRow}>
          <input className={styles.noteInput} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." />
          <button className={styles.btnSecondary} onClick={addNote} disabled={!newNote.trim()}>Add</button>
        </div>
      </div>
    </div>
  );
}
