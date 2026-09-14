'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminBranding.module.css';
import sharedStyles from './BrandingShared.module.css';

interface Asset { id: string; name: string; category: string; status: string; version: number; readinessScore: number | null; createdAt: string }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const CATEGORIES = ['logo', 'color_palette', 'typography', 'guideline_doc', 'template', 'other'];

export default function ManualTab() {
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('logo');
  const [description, setDescription] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/branding'); const data = await res.json(); setItems(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=branding&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { fetchItems(); loadRuns(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await fetch('/api/admin/branding', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), category, description: description.trim() || undefined }),
    });
    setName(''); setDescription(''); setShowForm(false);
    fetchItems(); loadRuns();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this asset?')) return;
    await fetch(`/api/admin/branding/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Track brand assets and guidelines (logos, color palettes, typography, guideline docs, templates) — real local CRUD with version tracking.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Attach a real file path and description before marking an asset &apos;approved&apos;</li></ul>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Asset'}</Button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div><label className={styles.formLabel}>Category</label>
              <select className={styles.formInput} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <label className={styles.formLabel}>Description</label>
            <textarea className={styles.formInput} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className={styles.formActions}><Button onClick={handleCreate} disabled={!name.trim()}>Create Asset</Button></div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No assets yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Category</th><th>Status</th><th>Version</th><th>Readiness</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td className={styles.nameCell}>{a.name}</td>
                  <td>{a.category}</td>
                  <td><Badge variant={a.status === 'approved' ? 'success' : 'default'}>{a.status}</Badge></td>
                  <td>v{a.version}</td>
                  <td>{a.readinessScore ?? '—'}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(a.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
