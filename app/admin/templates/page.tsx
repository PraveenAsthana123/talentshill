'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import styles from './AdminTemplates.module.css';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  subject: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', category: '', subject: '', htmlContent: '<html><body>{{content}}</body></html>' });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/templates');
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.subject || !form.htmlContent) return;
    await fetch('/api/admin/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
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
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Email Templates" subtitle="Create and manage email templates with variable support." />

      {!showCreate && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Button size="sm" onClick={() => setShowCreate(true)}>Create Template</Button>
        </div>
      )}

      {showCreate && (
        <div className={styles.formCard}>
          <div className={styles.formTitle}>Create Template</div>
          <div className={styles.formGrid}>
            <div><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><label className={styles.formLabel}>Category</label><input className={styles.formInput} value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} /></div>
            <div><label className={styles.formLabel}>Subject</label><input className={styles.formInput} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} /></div>
            <div><label className={styles.formLabel}>Description</label><input className={styles.formInput} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className={styles.formLabel}>HTML Content</label>
              <textarea className={styles.formTextarea} value={form.htmlContent} onChange={e => setForm(p => ({ ...p, htmlContent: e.target.value }))} />
            </div>
          </div>
          <div className={styles.formActions}>
            <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate}>Create</Button>
          </div>
        </div>
      )}

      <div className={styles.tableWrap}>
        {loading ? <div className={styles.empty}>Loading...</div> : templates.length === 0 ? <div className={styles.empty}>No templates yet.</div> : (
          <table className={styles.table}>
            <thead><tr><th>Name</th><th>Subject</th><th>Category</th><th>Actions</th></tr></thead>
            <tbody>
              {templates.map(t => (
                <tr key={t.id}>
                  <td className={styles.nameCell}>{t.name}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{t.subject}</td>
                  <td>{t.category ? <span className={styles.categoryBadge}>{t.category}</span> : '—'}</td>
                  <td><div className={styles.actions}><button className={styles.deleteBtn} onClick={() => handleDelete(t.id)}>Delete</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
