'use client';

import { useState, useEffect, use } from 'react';
import styles from './AdminChatRequest.module.css';

const STATUS_FLOW = ['new', 'triaged', 'responding', 'waiting_user', 'resolved', 'closed'];

export default function ChatRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [req, setReq] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [response, setResponse] = useState('');
  const [sending, setSending] = useState(false);

  const loadData = () => {
    fetch(`/api/admin/chat/requests/${id}`).then(r => r.json()).then(setReq);
    fetch(`/api/admin/chat/requests/${id}/notes`).then(r => r.json()).then(setNotes);
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
