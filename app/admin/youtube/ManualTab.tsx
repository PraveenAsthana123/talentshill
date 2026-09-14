'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminYoutube.module.css';
import sharedStyles from './YoutubeShared.module.css';

interface Video { id: string; title: string; status: string; description: string | null; externalVideoId: string | null; readinessScore: number | null; createdAt: string }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }
interface Snapshot { id: string; snapshotDate: string; subscriberCount: number; totalViews: number; totalWatchTimeMinutes: number | null; notes: string | null }

export default function ManualTab() {
  const [items, setItems] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);
  const [snapshotForm, setSnapshotForm] = useState({ snapshotDate: new Date().toISOString().slice(0, 10), subscriberCount: '', totalViews: '', totalWatchTimeMinutes: '', notes: '' });

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/youtube'); const data = await res.json(); setItems(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const fetchSnapshots = async () => {
    try { const res = await fetch('/api/admin/youtube/channel-snapshots'); const data = await res.json(); setSnapshots(data.items || []); } catch { /* empty */ }
  };
  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=youtube&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { fetchItems(); fetchSnapshots(); loadRuns(); }, []);

  const handleCreateSnapshot = async () => {
    if (!snapshotForm.snapshotDate || !snapshotForm.subscriberCount || !snapshotForm.totalViews) return;
    await fetch('/api/admin/youtube/channel-snapshots', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        snapshotDate: snapshotForm.snapshotDate, subscriberCount: Number(snapshotForm.subscriberCount), totalViews: Number(snapshotForm.totalViews),
        totalWatchTimeMinutes: snapshotForm.totalWatchTimeMinutes ? Number(snapshotForm.totalWatchTimeMinutes) : undefined,
        notes: snapshotForm.notes.trim() || undefined,
      }),
    });
    setSnapshotForm({ snapshotDate: new Date().toISOString().slice(0, 10), subscriberCount: '', totalViews: '', totalWatchTimeMinutes: '', notes: '' });
    setShowSnapshotForm(false);
    fetchSnapshots(); loadRuns();
  };
  const handleDeleteSnapshot = async (id: string) => {
    if (!confirm('Delete this snapshot?')) return;
    await fetch(`/api/admin/youtube/channel-snapshots/${id}`, { method: 'DELETE' });
    fetchSnapshots(); loadRuns();
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    await fetch('/api/admin/youtube', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), description: description.trim() || undefined }),
    });
    setTitle(''); setDescription(''); setShowForm(false);
    fetchItems(); loadRuns();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    await fetch(`/api/admin/youtube/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Track YouTube video production from planning through published — real local CRUD. No YouTube Data API integration exists (no real upload, no OAuth channel connection, no stats sync). See Governance.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Write a real description and tags before scoring readiness</li><li>Record the real YouTube video ID manually once a video is actually uploaded and published</li></ul>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Video'}</Button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div style={{ gridColumn: '1 / -1' }}><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <label className={styles.formLabel}>Description</label>
            <textarea className={styles.formInput} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className={styles.formActions}><Button onClick={handleCreate} disabled={!title.trim()}>Create Video</Button></div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No videos yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Status</th><th>Real Video ID</th><th>Readiness</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((v) => (
                <tr key={v.id}>
                  <td className={styles.nameCell}>{v.title}</td>
                  <td><Badge variant={v.status === 'published' ? 'success' : 'default'}>{v.status}</Badge></td>
                  <td>{v.externalVideoId || '—'}</td>
                  <td>{v.readinessScore ?? '—'}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(v.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={sharedStyles.subSection} style={{ marginTop: 'var(--space-6)' }}>
        <h4>Channel Snapshots (YouTube Channel Growth Engine)</h4>
        <p>Real, admin-entered point-in-time snapshots copied from your real YouTube Studio dashboard. No YouTube Data API/OAuth integration exists in this build — growth is always a real diff between two real snapshots, computed in the Pipeline tab.</p>
        <div className={styles.toolbar}>
          <Button size="sm" onClick={() => setShowSnapshotForm((v) => !v)}>{showSnapshotForm ? 'Cancel' : 'New Snapshot'}</Button>
        </div>
        {showSnapshotForm && (
          <div className={styles.formCard}>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Snapshot date</label><input className={styles.formInput} type="date" value={snapshotForm.snapshotDate} onChange={(e) => setSnapshotForm((p) => ({ ...p, snapshotDate: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Subscriber count</label><input className={styles.formInput} type="number" min={0} value={snapshotForm.subscriberCount} onChange={(e) => setSnapshotForm((p) => ({ ...p, subscriberCount: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Total views</label><input className={styles.formInput} type="number" min={0} value={snapshotForm.totalViews} onChange={(e) => setSnapshotForm((p) => ({ ...p, totalViews: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Total watch time (minutes, optional)</label><input className={styles.formInput} type="number" min={0} value={snapshotForm.totalWatchTimeMinutes} onChange={(e) => setSnapshotForm((p) => ({ ...p, totalWatchTimeMinutes: e.target.value }))} /></div>
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <label className={styles.formLabel}>Notes</label>
              <textarea className={styles.formInput} rows={2} value={snapshotForm.notes} onChange={(e) => setSnapshotForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className={styles.formActions}><Button onClick={handleCreateSnapshot} disabled={!snapshotForm.snapshotDate || !snapshotForm.subscriberCount || !snapshotForm.totalViews}>Create Snapshot</Button></div>
          </div>
        )}
        {snapshots.length === 0 ? <p className={sharedStyles.empty}>No channel snapshots yet.</p> : (
          <table className={styles.table}>
            <thead><tr><th>Date</th><th>Subscribers</th><th>Total Views</th><th>Watch Time (min)</th><th>Actions</th></tr></thead>
            <tbody>
              {snapshots.map((s) => (
                <tr key={s.id}>
                  <td>{new Date(s.snapshotDate).toLocaleDateString()}</td>
                  <td>{s.subscriberCount.toLocaleString()}</td>
                  <td>{s.totalViews.toLocaleString()}</td>
                  <td>{s.totalWatchTimeMinutes ?? '—'}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDeleteSnapshot(s.id)}>Delete</button></td>
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
