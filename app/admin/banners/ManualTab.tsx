'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import styles from './AdminBanners.module.css';
import sharedStyles from './BannersShared.module.css';

interface Banner {
  id: string; title: string; content: string; placement: string; severity: string;
  ctaText: string | null; ctaUrl: string | null; startDate: string | null; endDate: string | null;
  isActive: boolean; priority: number; createdAt: string;
}
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [runs, setRuns] = useState<RunEntry[]>([]);
  const [form, setForm] = useState({ title: '', content: '', placement: 'top', severity: 'info', ctaText: '', ctaUrl: '', startDate: '', endDate: '', priority: '0' });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const [res, rRes] = await Promise.all([
        fetch('/api/admin/banners'),
        fetch('/api/admin/operation-runs/?moduleKey=banners&executionMode=manual&limit=20'),
      ]);
      const data = await res.json();
      const rData = await rRes.json().catch(() => ({ runs: [] }));
      setBanners(data.banners || []);
      setRuns(rData.runs || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleCreate = async () => {
    if (!form.title || !form.content) return;
    await fetch('/api/admin/banners', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, priority: parseInt(form.priority, 10), startDate: form.startDate || undefined, endDate: form.endDate || undefined }),
    });
    setForm({ title: '', content: '', placement: 'top', severity: 'info', ctaText: '', ctaUrl: '', startDate: '', endDate: '', priority: '0' });
    setShowCreate(false);
    fetchBanners();
  };
  const handleToggle = async (banner: Banner) => {
    await fetch(`/api/admin/banners/${banner.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !banner.isActive }) });
    fetchBanners();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    fetchBanners();
  };
  const severityClass = (s: string) => {
    const map: Record<string, string> = { info: styles.severityInfo, success: styles.severitySuccess, warning: styles.severityWarning, error: styles.severityError };
    return map[s] || styles.severityInfo;
  };

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Manage site-wide promotional/notice banners with scheduling, placement, and CTA — real create/enable/disable/delete control.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Create banners with a valid schedule and consistent CTA (both text+URL or neither)</li><li>Run Pipeline or Agentic health checks before relying on a banner staying live</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        {!showCreate && <div style={{ marginBottom: 'var(--space-6)' }}><Button size="sm" onClick={() => setShowCreate(true)}>Create Banner</Button></div>}

        {showCreate && (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Create Banner</div>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Title</label><input className={styles.formInput} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} /></div>
              <div>
                <label className={styles.formLabel}>Placement</label>
                <select className={styles.formSelect} value={form.placement} onChange={(e) => setForm((p) => ({ ...p, placement: e.target.value }))}>
                  <option value="top">Top</option><option value="bottom">Bottom</option><option value="modal">Modal</option><option value="inline">Inline</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}><label className={styles.formLabel}>Content (HTML)</label><textarea className={styles.formTextarea} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} /></div>
              <div>
                <label className={styles.formLabel}>Severity</label>
                <select className={styles.formSelect} value={form.severity} onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}>
                  <option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option>
                </select>
              </div>
              <div><label className={styles.formLabel}>Priority</label><input className={styles.formInput} type="number" value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>CTA Text</label><input className={styles.formInput} value={form.ctaText} onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>CTA URL</label><input className={styles.formInput} value={form.ctaUrl} onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Start Date</label><input className={styles.formInput} type="datetime-local" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>End Date</label><input className={styles.formInput} type="datetime-local" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} /></div>
            </div>
            <div className={styles.formActions}>
              <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button size="sm" onClick={handleCreate}>Create</Button>
            </div>
          </div>
        )}

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.empty}>Loading...</div> : banners.length === 0 ? <div className={styles.empty}>No banners.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Title</th><th>Placement</th><th>Severity</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{b.title}</td>
                    <td><span className={styles.placementBadge}>{b.placement}</span></td>
                    <td><span className={cn(styles.severityBadge, severityClass(b.severity))}>{b.severity}</span></td>
                    <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                      {b.startDate ? new Date(typeof b.startDate === 'number' ? b.startDate * 1000 : b.startDate).toLocaleDateString() : 'Always'}
                      {b.endDate && ` — ${new Date(typeof b.endDate === 'number' ? b.endDate * 1000 : b.endDate).toLocaleDateString()}`}
                    </td>
                    <td><span className={b.isActive ? styles.activeBadge : styles.inactiveBadge}>{b.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={() => handleToggle(b)}>{b.isActive ? 'Disable' : 'Enable'}</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(b.id)}>Delete</button>
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
