'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui';
import styles from './AdminTemplates.module.css';
import sharedStyles from './TemplatesShared.module.css';

interface Template { id: string; name: string; description: string | null; category: string | null; subject: string; isActive: boolean; createdAt: string; updatedAt: string }
interface RunEntry { id: string; operationName: string; status: string; triggeredBy: string | null; createdAt: string }

export default function ManualTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', subject: '', htmlContent: '<html><body>{{content}}</body></html>' });
  const [runs, setRuns] = useState<RunEntry[]>([]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const [res, rRes] = await Promise.all([
        fetch('/api/admin/templates'),
        fetch('/api/admin/operation-runs/?moduleKey=templates&executionMode=manual&limit=20'),
      ]);
      const data = await res.json();
      const rData = await rRes.json().catch(() => ({ runs: [] }));
      setTemplates(data.templates || []);
      setRuns(rData.runs || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.subject || !form.htmlContent) return;
    await fetch('/api/admin/templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setForm({ name: '', description: '', category: '', subject: '', htmlContent: '<html><body>{{content}}</body></html>' });
    setShowCreate(false);
    fetchTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return;
    await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' });
    fetchTemplates();
  };

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Manage email templates with variable ({'{{'}placeholder{'}}'}) support — real create/edit/delete control, full editor and test-send live on the template detail page.</p>
      </div>
      <div className={sharedStyles.subSection}>
        <h4>Checklist</h4>
        <ul><li>Give every template a plaintext fallback and a real subject</li><li>Declare every {'{{'}placeholder{'}}'} used in the content — an undeclared one renders literally in a sent email</li><li>Run Pipeline or Agentic readiness scoring before relying on a template being send-ready</li></ul>
      </div>

      <div className={sharedStyles.subSection}>
        <h4>Input / Process / Output</h4>
        {!showCreate && <div style={{ marginBottom: 'var(--space-6)' }}><Button size="sm" onClick={() => setShowCreate(true)}>Create Template</Button></div>}

        {showCreate && (
          <div className={styles.formCard}>
            <div className={styles.formTitle}>Create Template</div>
            <div className={styles.formGrid}>
              <div><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Category</label><input className={styles.formInput} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Subject</label><input className={styles.formInput} value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} /></div>
              <div><label className={styles.formLabel}>Description</label><input className={styles.formInput} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label className={styles.formLabel}>HTML Content</label><textarea className={styles.formTextarea} value={form.htmlContent} onChange={(e) => setForm((p) => ({ ...p, htmlContent: e.target.value }))} /></div>
            </div>
            <div className={styles.formActions}><Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button><Button size="sm" onClick={handleCreate}>Create</Button></div>
          </div>
        )}

        <div className={styles.tableWrap}>
          {loading ? <div className={styles.empty}>Loading...</div> : templates.length === 0 ? <div className={styles.empty}>No templates yet.</div> : (
            <table className={styles.table}>
              <thead><tr><th>Name</th><th>Subject</th><th>Category</th><th>Actions</th></tr></thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id}>
                    <td className={styles.nameCell}>{t.name}</td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{t.subject}</td>
                    <td>{t.category ? <span className={styles.categoryBadge}>{t.category}</span> : '—'}</td>
                    <td>
                      <div className={styles.actions}>
                        <Link href={`/admin/templates/${t.id}`} className={styles.deleteBtn} style={{ color: 'var(--color-heading)' }}>Edit</Link>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(t.id)}>Delete</button>
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
