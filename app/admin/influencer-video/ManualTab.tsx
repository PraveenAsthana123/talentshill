'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminInfluencerVideo.module.css';
import sharedStyles from './InfluencerVideoShared.module.css';

interface Campaign { id: string; influencerName: string; platform: string; status: string; agreedFee: number | null; contactEmail: string | null; readinessScore: number | null; createdAt: string }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

const PLATFORMS = ['instagram', 'youtube', 'tiktok', 'linkedin', 'other'];

export default function ManualTab() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [influencerName, setInfluencerName] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [contactEmail, setContactEmail] = useState('');
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchItems = async () => {
    setLoading(true);
    try { const res = await fetch('/api/admin/influencer-video'); const data = await res.json(); setItems(data.items || []); } catch { /* empty */ }
    setLoading(false);
  };
  const loadRuns = () => {
    fetch('/api/admin/operation-runs/?moduleKey=influencer_video&executionMode=manual&limit=20')
      .then((r) => (r.ok ? r.json() : { runs: [] })).then((d) => setRuns(d.runs || [])).catch(() => {});
  };
  useEffect(() => { fetchItems(); loadRuns(); }, []);

  const handleCreate = async () => {
    if (!influencerName.trim()) return;
    await fetch('/api/admin/influencer-video', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ influencerName: influencerName.trim(), platform, contactEmail: contactEmail.trim() || undefined }),
    });
    setInfluencerName(''); setContactEmail(''); setShowForm(false);
    fetchItems(); loadRuns();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this campaign?')) return;
    await fetch(`/api/admin/influencer-video/${id}`, { method: 'DELETE' });
    fetchItems(); loadRuns();
  };

  return (
    <div className={styles.page}>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Track influencer partnerships and deliverables — real local CRUD. Contact email is real PII collected for a real business purpose (partnership coordination); see Governance.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Enter a real contact email and define deliverables before moving past &apos;prospecting&apos;</li><li>Set the agreed fee once status reaches &apos;active&apos;</li></ul>
      </div>

      <div className={styles.toolbar}>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Cancel' : 'New Campaign'}</Button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Influencer Name</label><input className={styles.formInput} value={influencerName} onChange={(e) => setInfluencerName(e.target.value)} /></div>
            <div><label className={styles.formLabel}>Platform</label>
              <select className={styles.formInput} value={platform} onChange={(e) => setPlatform(e.target.value)}>
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div><label className={styles.formLabel}>Contact Email</label><input className={styles.formInput} type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} /></div>
          </div>
          <div className={styles.formActions}><Button onClick={handleCreate} disabled={!influencerName.trim()}>Create Campaign</Button></div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : items.length === 0 ? <div className={styles.empty}>No campaigns yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Influencer</th><th>Platform</th><th>Status</th><th>Fee</th><th>Readiness</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td className={styles.nameCell}>{c.influencerName}</td>
                  <td>{c.platform}</td>
                  <td><Badge variant={c.status === 'active' ? 'success' : 'default'}>{c.status}</Badge></td>
                  <td>{c.agreedFee != null ? `$${c.agreedFee}` : '—'}</td>
                  <td>{c.readinessScore ?? '—'}</td>
                  <td><button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => handleDelete(c.id)}>Delete</button></td>
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
