'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminReelsManagement.module.css';
import sharedStyles from './ReelsManagementShared.module.css';

interface Reel { id: string; title: string; platform: string; status: string; caption: string | null; readinessScore: number | null; createdAt: string }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const PLATFORMS = ['instagram', 'tiktok', 'youtube_shorts', 'other'];

export default function ManualTab() {
  const [items, setItems] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [caption, setCaption] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/reels-management'); const data = await res.json(); setItems(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=reels_management&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { fetchItems(); loadRuns(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await fetch('/api/admin/reels-management', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), platform, caption: caption.trim() || undefined }),
    });
    setTitle(''); setCaption(''); setShowForm(false);
    fetchItems(); loadRuns();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reel?')) return;
    await fetch(`/api/admin/reels-management/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Real content-calendar tracking for short-form video (Reels/Shorts/TikTok) from idea through published — real local CRUD. No auto-publish scheduler or platform API integration exists; see Governance.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Write a real caption and attach an asset URL before moving past &apos;filmed&apos;</li><li>Set scheduledAt before marking &apos;scheduled&apos;</li></ul>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Reel'}</Button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label className={styles.formLabel}>Platform</label>
              <select className={styles.formInput} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <label className={styles.formLabel}>Caption</label>
            <textarea className={styles.formInput} rows={2} value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div className={styles.formActions}><Button onClick={handleCreate} disabled={!title.trim()}>Create Reel</Button></div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No reels yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Platform</th><th>Status</th><th>Readiness</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((r) => (
                <tr key={r.id}>
                  <td className={styles.nameCell}>{r.title}</td>
                  <td>{r.platform}</td>
                  <td><Badge variant={r.status === 'published' ? 'success' : 'default'}>{r.status}</Badge></td>
                  <td>{r.readinessScore ?? '—'}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(r.id)}>Delete</button></td>
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
