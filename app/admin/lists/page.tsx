'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminLists.module.css';

interface ListItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  memberCount: number;
  createdAt: string;
}

export default function AdminListsPage() {
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'static' });

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
    <div className={styles.page}>
      <SectionHeader label="CRM" title="Lists" subtitle="Create and manage contact lists for campaigns." />

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
  );
}
