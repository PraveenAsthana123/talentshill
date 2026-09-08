'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminCampaigns.module.css';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  audienceType: string | null;
  subject: string | null;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  createdAt: string;
}

interface ListItem { id: string; name: string; memberCount: number; }
interface Template { id: string; name: string; subject: string; }

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', audienceType: 'list', audienceId: '', templateId: '' });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [cRes, lRes, tRes] = await Promise.all([
        fetch('/api/admin/campaigns'),
        fetch('/api/admin/lists'),
        fetch('/api/admin/templates'),
      ]);
      const cData = await cRes.json();
      const lData = await lRes.json();
      const tData = await tRes.json();
      setCampaigns(cData.campaigns || []);
      setLists(lData.lists || []);
      setTemplates(tData.templates || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    await fetch('/api/admin/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', subject: '', audienceType: 'list', audienceId: '', templateId: '' });
    setShowCreate(false);
    fetchAll();
  };

  const handleLaunch = async (id: string) => {
    if (!confirm('Launch this campaign?')) return;
    await fetch(`/api/admin/campaigns/${id}/launch`, { method: 'POST' });
    fetchAll();
  };

  const handlePause = async (id: string) => {
    await fetch(`/api/admin/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'paused' }),
    });
    fetchAll();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch(`/api/admin/campaigns/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const statusClass = (s: string) => {
    const map: Record<string, string> = {
      draft: styles.statusDraft, scheduled: styles.statusScheduled, sending: styles.statusSending,
      completed: styles.statusCompleted, paused: styles.statusPaused, cancelled: styles.statusCancelled,
    };
    return map[s] || styles.statusDraft;
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Campaigns" subtitle="Create and manage email campaigns." />

      <div className={styles.statsRow}>
        <div className={styles.statBadge}><span className={styles.statValue}>{campaigns.length}</span><span className={styles.statLabel}>Total</span></div>
        <div className={styles.statBadge}><span className={styles.statValue}>{campaigns.filter(c => c.status === 'completed').length}</span><span className={styles.statLabel}>Completed</span></div>
        <div className={styles.statBadge}><span className={styles.statValue}>{campaigns.reduce((sum, c) => sum + (c.totalSent || 0), 0)}</span><span className={styles.statLabel}>Emails Sent</span></div>
      </div>

      {!showCreate && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Button size="sm" onClick={() => setShowCreate(true)}>Create Campaign</Button>
        </div>
      )}

      {showCreate && (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Create Campaign</div>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Campaign Name</label><input className={styles.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className={styles.formLabel}>Subject Line</label><input className={styles.formInput} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
            <div>
              <label className={styles.formLabel}>Audience</label>
              <select className={styles.formSelect} value={form.audienceId} onChange={e => setForm(p => ({ ...p, audienceId: e.target.value }))}>
                <option value="">Select a list</option>
                {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({l.memberCount})</option>)}
              </select>
            </div>
            <div>
              <label className={styles.formLabel}>Template</label>
              <select className={styles.formSelect} value={form.templateId} onChange={e => setForm(p => ({ ...p, templateId: e.target.value }))}>
                <option value="">Select a template</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : campaigns.length === 0 ? <div className={styles.empty}>No campaigns yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Subject</th><th>Status</th><th>Sent</th><th>Opened</th><th>Clicked</th><th>Actions</th></tr></thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td className={styles.nameCell}>{c.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{c.subject || '—'}</td>
                  <td><span className={cn(styles.statusBadge, statusClass(c.status))}>{c.status}</span></td>
                  <td className={styles.metricCell}><span className={styles.metricValue}>{c.totalSent || 0}</span></td>
                  <td className={styles.metricCell}><span className={styles.metricValue}>{c.totalOpened || 0}</span></td>
                  <td className={styles.metricCell}><span className={styles.metricValue}>{c.totalClicked || 0}</span></td>
                  <td>
                    <div className={styles.actions}>
                      {c.status === 'draft' && <button className={styles.actionBtn} onClick={() => handleLaunch(c.id)}>Launch</button>}
                      {c.status === 'sending' && <button className={styles.actionBtn} onClick={() => handlePause(c.id)}>Pause</button>}
                      {c.status === 'paused' && <button className={styles.actionBtn} onClick={() => handleLaunch(c.id)}>Resume</button>}
                      <button className={styles.deleteBtn} onClick={() => handleDelete(c.id)}>Delete</button>
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
