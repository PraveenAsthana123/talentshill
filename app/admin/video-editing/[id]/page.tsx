'use client';

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui';
import styles from './AdminVideoProject.module.css';

interface ClipPlan {
  id: string; title: string; startSeconds: number; endSeconds: number;
  targetPlatform: string; targetAspectRatio: string; status: string;
  outputUrl: string | null; notes: string | null; readinessScore: number | null;
}
interface CoverageResult { clipCount: number; totalClipSeconds: number; sourceDurationSeconds: number | null; coverageRatio: number | null; invalidRangeCount: number }
interface IdeasResult { ideas: string | null; fabricationWarning: boolean; coverage: CoverageResult }

const PLATFORMS = ['instagram_reels', 'tiktok', 'youtube_shorts', 'linkedin', 'other'];
const ASPECT_RATIOS = ['9:16', '1:1', '16:9', '4:5'];

export default function VideoProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [project, setProject] = useState<any>(null);
  const [clips, setClips] = useState<ClipPlan[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', startSeconds: '', endSeconds: '', targetPlatform: 'instagram_reels', targetAspectRatio: '9:16', notes: '' });

  const [coverage, setCoverage] = useState<CoverageResult | null>(null);
  const [coverageRunning, setCoverageRunning] = useState(false);
  const [ideasResult, setIdeasResult] = useState<IdeasResult | null>(null);
  const [ideasRunning, setIdeasRunning] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    fetch(`/api/admin/video-editing/${id}`).then((r) => r.json()).then((d) => setProject(d.project));
    fetch(`/api/admin/video-editing/${id}/clips`).then((r) => r.json()).then((d) => setClips(d.items || []));
  };

  useEffect(() => { loadData(); }, [id]);

  const addClip = async () => {
    if (!form.title.trim() || !form.startSeconds || !form.endSeconds) return;
    await fetch(`/api/admin/video-editing/${id}/clips`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title.trim(), startSeconds: Number(form.startSeconds), endSeconds: Number(form.endSeconds),
        targetPlatform: form.targetPlatform, targetAspectRatio: form.targetAspectRatio, notes: form.notes.trim() || undefined,
      }),
    });
    setForm({ title: '', startSeconds: '', endSeconds: '', targetPlatform: 'instagram_reels', targetAspectRatio: '9:16', notes: '' });
    setShowForm(false);
    loadData();
  };

  const runClipReadiness = async (clipId: string) => {
    await fetch(`/api/admin/video-editing/clips/${clipId}/readiness`, { method: 'POST' });
    loadData();
  };

  const runCoverage = async () => {
    setCoverageRunning(true); setError(''); setCoverage(null);
    try {
      const res = await fetch(`/api/admin/video-editing/${id}/coverage`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setCoverage(data);
    } catch (e) { setError(String(e)); } finally { setCoverageRunning(false); }
  };

  const runIdeas = async () => {
    setIdeasRunning(true); setError(''); setIdeasResult(null);
    try {
      const res = await fetch(`/api/admin/video-editing/${id}/ideas`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setIdeasResult(data);
    } catch (e) { setError(String(e)); } finally { setIdeasRunning(false); }
  };

  if (!project) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{project.title}</h1>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Tool</span><span>{project.tool}</span></div>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Status</span><span>{project.status}</span></div>
        <div className={styles.metaItem}><span className={styles.metaLabel}>Duration</span><span>{project.durationSeconds ? `${project.durationSeconds}s` : 'not set'}</span></div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Clip Plans ({clips.length})</h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Real, admin-entered planning records — no video-processing integration exists in this build, so no
          clip is ever auto-rendered. &quot;Delivered&quot; means you attached a real link to a clip you produced externally.
        </p>
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Clip Plan'}</button>
        </div>
        {showForm && (
          <div className={styles.formCard}>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
              <div>
                <label className={styles.formLabel}>Target platform</label>
                <select className={styles.formInput} value={form.targetPlatform} onChange={(e) => setForm((p) => ({ ...p, targetPlatform: e.target.value }))}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div><label className={styles.formLabel}>Start (seconds, in source)</label><input className={styles.formInput} type="number" min={0} value={form.startSeconds} onChange={(e) => setForm((p) => ({ ...p, startSeconds: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>End (seconds, in source)</label><input className={styles.formInput} type="number" min={0} value={form.endSeconds} onChange={(e) => setForm((p) => ({ ...p, endSeconds: e.target.value }))} /></div>
              <div>
                <label className={styles.formLabel}>Target aspect ratio</label>
                <select className={styles.formInput} value={form.targetAspectRatio} onChange={(e) => setForm((p) => ({ ...p, targetAspectRatio: e.target.value }))}>
                  {ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <label className={styles.formLabel}>Notes</label>
              <textarea className={styles.formInput} rows={2} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
            </div>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <button className={styles.btnPrimary} onClick={addClip} disabled={!form.title.trim() || !form.startSeconds || !form.endSeconds}>Create Clip Plan</button>
            </div>
          </div>
        )}

        {clips.length === 0 ? <p className={styles.empty}>No clip plans yet.</p> : (
          <table className={styles.table}>
            <thead><tr><th>Title</th><th>Range</th><th>Platform</th><th>Aspect</th><th>Status</th><th>Readiness</th><th></th></tr></thead>
            <tbody>
              {clips.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.startSeconds}s–{c.endSeconds}s</td>
                  <td>{c.targetPlatform}</td>
                  <td>{c.targetAspectRatio}</td>
                  <td><Badge variant={c.status === 'delivered' ? 'success' : 'default'}>{c.status}</Badge></td>
                  <td>{c.readinessScore ?? '—'}</td>
                  <td><button className={styles.btnSecondary} onClick={() => runClipReadiness(c.id)}>Score</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Repurposing Coverage &amp; Ideas</h2>
        <div className={styles.btnRow}>
          <button className={styles.btnPrimary} onClick={runCoverage} disabled={coverageRunning}>{coverageRunning ? 'Computing…' : 'Run Coverage'}</button>
          <button className={styles.btnSecondary} onClick={runIdeas} disabled={ideasRunning}>{ideasRunning ? 'Agent running (30-60s)…' : 'Suggest Clip Ideas'}</button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
        {coverage && (
          <div className={styles.card}>
            <strong>{coverage.clipCount} clip(s), {coverage.totalClipSeconds}s covered{coverage.coverageRatio !== null ? ` (${Math.round(coverage.coverageRatio * 100)}% of source)` : ' (source duration not set)'}</strong>
            {coverage.invalidRangeCount > 0 && <p style={{ color: 'crimson' }}>{coverage.invalidRangeCount} clip(s) have an invalid/out-of-range timestamp.</p>}
          </div>
        )}
        {ideasResult?.ideas && (
          <div className={styles.card}>
            <div className={styles.cardHeader}><strong>Suggested clip ideas (unverified — review against the real footage)</strong>{ideasResult.fabricationWarning && <Badge variant="warning">possible fabrication — verify</Badge>}</div>
            <div className={styles.field}>{ideasResult.ideas}</div>
          </div>
        )}
      </div>
    </div>
  );
}
