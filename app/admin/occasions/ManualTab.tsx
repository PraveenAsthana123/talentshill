'use client';

import { useEffect, useState } from 'react';
import { Badge, Button } from '@/components/ui';
import styles from './OccasionsShared.module.css';

interface ContactOption { id: string; firstName: string | null; lastName: string | null; email: string }
interface MessageRow { contactId: string; occasionType: string; festivalCode: string | null; channel: string; status: string; triggeredAt: string }

export default function ManualTab() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<ContactOption[]>([]);
  const [contactId, setContactId] = useState('');
  const [channel, setChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [subject, setSubject] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [recent, setRecent] = useState<MessageRow[]>([]);

  const loadRecent = () => {
    fetch('/api/admin/occasions/report/').then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((d) => setRecent((d.messages || []).slice(0, 15))).catch(() => {});
  };

  useEffect(() => { loadRecent(); }, []);

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/admin/contacts?search=${encodeURIComponent(search)}&limit=10`)
        .then((r) => (r.ok ? r.json() : { contacts: [] }))
        .then((d) => setResults(d.contacts || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSend = async () => {
    if (!contactId) { setError('Select a contact first.'); return; }
    if (!messageBody.trim()) { setError('Message body is required.'); return; }
    setSending(true); setError(''); setSent(false);
    try {
      const res = await fetch('/api/admin/occasions/custom/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contactId, channel, subject: channel === 'email' ? subject : null, messageBody }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSent(true); setMessageBody(''); setSubject(''); loadRecent();
    } catch (e) { setError(String(e)); } finally { setSending(false); }
  };

  return (
    <div>
      <div className={styles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Send a real, admin-typed custom occasion message to one real contact — never a template, never model-generated. Admin-level only (no customer self-service surface for this module). Status is always &quot;logged&quot;, never a fabricated delivery confirmation — see Governance.</p>
      </div>

      <div className={styles.subSection}>
        <h4>Find contact</h4>
        <input className={styles.input} placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        {results.length > 0 && (
          <table className={styles.table} style={{ marginTop: 'var(--space-3)' }}>
            <thead><tr><th></th><th>Name</th><th>Email</th></tr></thead>
            <tbody>
              {results.map((c) => (
                <tr key={c.id} style={{ cursor: 'pointer', background: contactId === c.id ? 'rgba(30,64,175,0.06)' : undefined }} onClick={() => { setContactId(c.id); setSearch(`${c.firstName ?? ''} ${c.lastName ?? ''} <${c.email}>`.trim()); setResults([]); }}>
                  <td><input type="radio" checked={contactId === c.id} readOnly /></td>
                  <td>{c.firstName ?? ''} {c.lastName ?? ''}</td>
                  <td>{c.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.subSection}>
        <h4>Compose &amp; send</h4>
        <label className={styles.label}>Channel</label>
        <select className={styles.input} value={channel} onChange={(e) => setChannel(e.target.value as 'email' | 'sms' | 'whatsapp')}>
          <option value="email">Email</option><option value="sms">SMS</option><option value="whatsapp">WhatsApp</option>
        </select>
        {channel === 'email' && (<>
          <label className={styles.label} style={{ marginTop: 'var(--space-3)' }}>Subject</label>
          <input className={styles.input} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </>)}
        <label className={styles.label} style={{ marginTop: 'var(--space-3)' }}>Message</label>
        <textarea className={styles.input} rows={4} value={messageBody} onChange={(e) => setMessageBody(e.target.value)} />
        <div className={styles.formActions}><Button onClick={handleSend} disabled={sending}>{sending ? 'Logging…' : 'Send Custom Message'}</Button></div>
        {error && <p className={styles.error}>{error}</p>}
        {sent && <p>Logged.</p>}
      </div>

      <div className={styles.subSection}>
        <h4>Recent occasion messages</h4>
        {recent.length === 0 && <p className={styles.empty}>None logged yet.</p>}
        <table className={styles.table}>
          <thead><tr><th>When</th><th>Type</th><th>Festival</th><th>Channel</th><th>Status</th></tr></thead>
          <tbody>
            {recent.map((m, i) => (
              <tr key={i}>
                <td>{new Date(m.triggeredAt).toLocaleString()}</td>
                <td>{m.occasionType}</td>
                <td>{m.festivalCode ?? '—'}</td>
                <td>{m.channel}</td>
                <td><Badge variant={m.status === 'logged' ? 'success' : 'error'}>{m.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
