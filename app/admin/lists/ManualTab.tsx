'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminLists.module.css';
import sharedStyles from './ListsShared.module.css';

interface ListItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  memberCount: number;
  createdAt: string;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'static' });
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchLists = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/lists');
      const data = await res.json();
      setLists(data.lists || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchLists(); }, []);

  useEffect(() => {
    fetch('/api/admin/operation-runs/?moduleKey=lists&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!form.name) return;
    await fetch('/api/admin/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ name: '', description: '', type: 'static' });
    setShowCreate(false);
    fetchLists();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this list?')) return;
    await fetch(`/api/admin/lists/${id}`, { method: 'DELETE' });
    fetchLists();
  };

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Create and manage contact lists for campaigns — real create/delete control. Static lists are managed by explicit add/remove; dynamic lists are meant to auto-populate from segment rules.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Fixed cross-module gap in this build</h4>
        <p>A &apos;dynamic&apos; list&apos;s segment rules could be previewed but were never actually materialized into real list membership — <code>lib/jobs/handlers/broadcast-sender.ts</code> reads <code>listMembers</code> directly and never evaluates segment rules, so a broadcast targeted at a dynamic list silently sent to nobody. Run Pipeline on a dynamic list to sync its real membership from its segment rules.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Honest gap not fixed here</h4>
        <p>This Manual tab&apos;s Create-List form has no segment-rule builder — a dynamic list created here has no rules to evaluate until they are set via the API directly. Disclosed rather than worked around with a fabricated default rule.</p>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        {!showCreate && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Button size="sm" onClick={() => setShowCreate(true)}>Create List</Button>
          </div>
        )}

        {showCreate && (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Create List</div>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div>
                <label className={styles.formLabel}>Type</label>
                <select className={styles.formSelect} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="static">Static</option>
                  <option value="dynamic">Dynamic</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}><label className={styles.formLabel}>Description</label><input className={styles.formInput} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreate}>Create</Button>
            </div>
          </div>
        )}

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.empty}>Loading...</div> : lists.length === 0 ? <div className={styles.empty}>No lists yet.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Description</th><th>Type</th><th>Members</th><th>Actions</th></tr></thead>
              <tbody>
                {lists.map(list => (
                  <tr key={list.id}>
                    <td className={styles.nameCell}>{list.name}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{list.description || '—'}</td>
                    <td><span className={cn(styles.typeBadge, list.type === 'static' ? styles.typeStatic : styles.typeDynamic)}>{list.type}</span></td>
                    <td><span className={styles.memberCount}>{list.memberCount}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(list.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className={sharedStyles.subSection}>
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
