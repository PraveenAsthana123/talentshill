'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import styles from './AdminOverrides.module.css';

interface ContentOverride {
  id: string;
  pageSlug: string;
  section: string;
  key: string;
  value: string | null;
  isActive: boolean;
  updatedBy: string | null;
  updatedAt: string;
}

export default function AdminContentOverridesPage() {
  const [overrides, setOverrides] = useState<ContentOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ pageSlug: '', section: '', key: '', value: '' });

  const fetchOverrides = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content-overrides');
      const data = await res.json();
      setOverrides(data.overrides || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchOverrides(); }, []);

  const handleCreate = async () => {
    if (!form.pageSlug || !form.section || !form.key) return;
    await fetch('/api/admin/content-overrides', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, value: form.value }),
    });
    setForm({ pageSlug: '', section: '', key: '', value: '' });
    setShowCreate(false);
    fetchOverrides();
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await fetch('/api/admin/content-overrides', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    fetchOverrides();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this override?')) return;
    await fetch('/api/admin/content-overrides', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchOverrides();
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Operations" title="Content Overrides" subtitle="Override page content dynamically without code changes." />

      {!showCreate && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Button size="sm" onClick={() => setShowCreate(true)}>Add Override</Button>
        </div>
      )}

      {showCreate && (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Add Content Override</div>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Page Slug</label><input className={styles.formInput} value={form.pageSlug} onChange={e => setForm(p => ({ ...p, pageSlug: e.target.value }))} placeholder="e.g., home" /></div>
            <div><label className={styles.formLabel}>Section</label><input className={styles.formInput} value={form.section} onChange={e => setForm(p => ({ ...p, section: e.target.value }))} placeholder="e.g., hero" /></div>
            <div><label className={styles.formLabel}>Key</label><input className={styles.formInput} value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))} placeholder="e.g., title" /></div>
            <div><label className={styles.formLabel}>Value</label><input className={styles.formInput} value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} placeholder="Override value" /></div>
          </div>
          <div className={styles.formActions}>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate}>Save</Button>
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : overrides.length === 0 ? <div className={styles.empty}>No overrides yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Page</th><th>Section</th><th>Key</th><th>Value</th><th>Active</th><th>Actions</th></tr></thead>
            <tbody>
              {overrides.map(o => (
                <tr key={o.id}>
                  <td className={styles.nameCell}>{o.pageSlug}</td>
                  <td>{o.section}</td>
                  <td>{o.key}</td>
                  <td className={styles.valueCell}>{o.value || '—'}</td>
                  <td>
                    <button className={o.isActive ? styles.activeBadge : styles.inactiveBadge} onClick={() => handleToggle(o.id, o.isActive)}>
                      {o.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(o.id)}>Delete</button>
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
