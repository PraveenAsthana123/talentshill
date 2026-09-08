'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminBroadcasts.module.css';

interface Broadcast {
  id: string;
  name: string;
  subject: string;
  status: string;
  totalSent: number;
  totalFailed: number;
  createdAt: string;
}

interface ListItem { id: string; name: string; memberCount: number; }

export default function AdminBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', htmlContent: '<html><body>{{content}}</body></html>', audienceType: 'list', audienceId: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, lRes] = await Promise.all([
        fetch('/api/admin/broadcasts'),
        fetch('/api/admin/lists'),
      ]);
      const bData = await bRes.json();
      const lData = await lRes.json();
      setBroadcasts(bData.broadcasts || []);
      setLists(lData.lists || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.subject) return;
    await fetch('/api/admin/broadcasts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', subject: '', htmlContent: '<html><body>{{content}}</body></html>', audienceType: 'list', audienceId: '' });
    setShowCreate(false);
    fetchAll();
  };

  const handleLaunch = async (id: string) => {
    if (!confirm('Launch this broadcast?')) return;
    await fetch(`/api/admin/broadcasts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'launch' }),
    });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this broadcast?')) return;
    await fetch(`/api/admin/broadcasts/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const statusClass = (s: string) => {
    const map: Record<string, string> = {
      draft: styles.statusDraft, scheduled: styles.statusScheduled, sending: styles.statusSending,
      paused: styles.statusPaused, completed: styles.statusCompleted,
    };
    return map[s] || styles.statusDraft;
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Operations" title="Broadcasts" subtitle="Send bulk email broadcasts to your audiences." />

      {!showCreate && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Button size="sm" onClick={() => setShowCreate(true)}>Create Broadcast</Button>
        </div>
      )}

      {showCreate && (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Create Broadcast</div>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className={styles.formLabel}>Subject</label><input className={styles.formInput} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
            <div>
              <label className={styles.formLabel}>Audience</label>
              <select className={styles.formSelect} value={form.audienceId} onChange={e => setForm(p => ({ ...p, audienceId: e.target.value }))}>
                <option value="">Select a list</option>
                {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.memberCount})</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className={styles.formLabel}>HTML Content</label>
              <textarea className={styles.formTextarea} value={form.htmlContent} onChange={e => setForm(p => ({ ...p, htmlContent: e.target.value }))} />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : broadcasts.length === 0 ? <div className={styles.empty}>No broadcasts yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Subject</th><th>Status</th><th>Sent</th><th>Failed</th><th>Actions</th></tr></thead>
            <tbody>
              {broadcasts.map(b => (
                <tr key={b.id}>
                  <td className={styles.nameCell}>{b.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{b.subject}</td>
                  <td><span className={cn(styles.statusBadge, statusClass(b.status))}>{b.status}</span></td>
                  <td className={styles.metricCell}>{b.totalSent || 0}</td>
                  <td className={styles.metricCell}>{b.totalFailed || 0}</td>
                  <td>
                    <div className={styles.actions}>
                      {b.status === 'draft' && <button className={styles.actionBtn} onClick={() => handleLaunch(b.id)}>Launch</button>}
                      <button className={styles.deleteBtn} onClick={() => handleDelete(b.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
