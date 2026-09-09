'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminOverrides.module.css';
import sharedStyles from './OverridesShared.module.css';

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
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [overrides, setOverrides] = useState<ContentOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ pageSlug: '', section: '', key: '', value: '' });
  const [runs, setRuns] = useState<RunEntry[]>([]);

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

  useEffect(() => {
    fetch('/api/admin/operation-runs/?moduleKey=content_overrides&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  }, []);

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
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Override page content dynamically without code changes — real create/toggle/delete control.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Never paste raw HTML/script into a value — it is not sanitized on read</li><li>Use lowercase slug-like identifiers for pageSlug/section/key</li><li>Run Pipeline or Agentic safety scoring after adding or editing an override</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
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
