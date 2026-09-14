'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminVideoEditing.module.css';
import sharedStyles from './VideoEditingShared.module.css';

interface Project {
  id: string; title: string; tool: string; status: string; strategyNotes: string | null; readinessScore: number | null; createdAt: string;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const TOOLS = ['adobe_premiere', 'adobe_after_effects', 'capcut', 'heygen', 'other'];

// Real, defensible editing/viral-strategy guidance -- per this
// module's disclosed scope (module_registry: "VFX, viral-video-making
// strategy, editing strategy with dos/donts, and planning guidance").
// Static reference content, not fabricated performance data.
const PLAYBOOK = [
  { do: 'Hook viewers in the first 1-2 seconds -- lead with the payoff or a visual pattern-break, not a slow intro.', dont: "Don't open with a logo animation or a slow fade-in on short-form video -- viewers scroll past before it finishes." },
  { do: 'Caption everything -- most short-form video is watched muted.', dont: "Don't rely on voiceover alone to carry the message." },
  { do: 'Cut on action and keep shots under 3-4 seconds for fast-paced viral edits.', dont: "Don't leave static, un-cut B-roll longer than the point it's making." },
  { do: 'Match cuts to the audio beat when using trending sound.', dont: "Don't ignore the platform's native aspect ratio (9:16 for Reels/Shorts/TikTok) -- pillarboxed horizontal video reads as low-effort." },
];

export default function ManualTab() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [tool, setTool] = useState('adobe_premiere');
  const [strategyNotes, setStrategyNotes] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/video-editing'); const data = await res.json(); setItems(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=video_editing&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { fetchItems(); loadRuns(); }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    await fetch('/api/admin/video-editing', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), tool, strategyNotes: strategyNotes.trim() || undefined }),
    });
    setTitle(''); setStrategyNotes(''); setShowForm(false);
    fetchItems(); loadRuns();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    await fetch(`/api/admin/video-editing/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Track video projects and their editing strategy — real local CRUD. No Adobe/CapCut/HeyGen API integration exists (tool is a classification field, not a live connection). See Governance.</p>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Editing &amp; viral-strategy playbook (real, static reference guidance)</h4>
        <table className={sharedStyles.table}>
          <thead><tr><th>Do</th><th>Don&apos;t</th></tr></thead>
          <tbody>{PLAYBOOK.map((p, i) => <tr key={i}><td>{p.do}</td><td>{p.dont}</td></tr>)}</tbody>
        </table>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Project'}</Button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><label className={styles.formLabel}>Tool</label>
              <select className={styles.formInput} value={tool} onChange={(e) => setTool(e.target.value)}>
                {TOOLS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <label className={styles.formLabel}>Strategy notes (dos/don&apos;ts, VFX plan)</label>
            <textarea className={styles.formInput} rows={3} value={strategyNotes} onChange={(e) => setStrategyNotes(e.target.value)} />
          </div>
          <div className={styles.formActions}><Button onClick={handleCreate} disabled={!title.trim()}>Create Project</Button></div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No projects yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Tool</th><th>Status</th><th>Readiness</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id}>
                  <td className={styles.nameCell}>{p.title}</td>
                  <td>{p.tool}</td>
                  <td><Badge variant={p.status === 'published' ? 'success' : 'default'}>{p.status}</Badge></td>
                  <td>{p.readinessScore ?? '—'}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(p.id)}>Delete</button></td>
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
