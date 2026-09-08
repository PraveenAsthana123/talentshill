'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminContentEditor.module.css';

interface ContentVersion {
  id: string;
  versionNumber: number;
  title: string;
  changeNote: string | null;
  createdAt: string;
}

export default function AdminContentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [contentType, setContentType] = useState('');
  const [status, setStatus] = useState('draft');
  const [versions, setVersions] = useState<ContentVersion[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const variables = ['firstName', 'lastName', 'email', 'company', 'productName'];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/admin/content/${id}`);
        const data = await res.json();
        if (data.content) {
          setTitle(data.content.title || '');
          setBody(data.content.body || '');
          setExcerpt(data.content.excerpt || '');
          setTags(data.content.tags ? JSON.parse(data.content.tags) : []);
          setCategory(data.content.category || '');
          setContentType(data.content.contentType || '');
          setStatus(data.content.status || 'draft');
        }
        if (data.versions) setVersions(data.versions);
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchContent();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await fetch(`/api/admin/content/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, excerpt, tags, category }),
      });
      await fetch(`/api/admin/content/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changeNote: 'Manual save' }),
      });
      const vRes = await fetch(`/api/admin/content/${id}`);
      const vData = await vRes.json();
      if (vData.versions) setVersions(vData.versions);
      setMessage('Saved successfully');
    } catch { setMessage('Error saving'); }
    setSaving(false);
  };

  const handlePublish = async () => {
    try {
      await fetch(`/api/admin/content/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      setStatus('published');
      setMessage('Content published');
    } catch { setMessage('Error publishing'); }
  };

  const handleUnpublish = async () => {
    try {
      await fetch(`/api/admin/content/${id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish' }),
      });
      setStatus('draft');
      setMessage('Content unpublished');
    } catch { setMessage('Error unpublishing'); }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm('Rollback to this version? Current changes will be replaced.')) return;
    try {
      await fetch(`/api/admin/content/${id}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rollback', versionId }),
      });
      const res = await fetch(`/api/admin/content/${id}`);
      const data = await res.json();
      if (data.content) {
        setTitle(data.content.title || '');
        setBody(data.content.body || '');
      }
      setMessage('Rolled back successfully');
    } catch { setMessage('Error rolling back'); }
  };

  const insertVariable = (v: string) => setBody(prev => prev + `{{${v}}}`);
  const insertTag = (tag: string) => { if (tag.trim() && !tags.includes(tag.trim())) { setTags([...tags, tag.trim()]); setTagInput(''); } };
  const removeTag = (tag: string) => setTags(tags.filter(t => t !== tag));

  if (loading) return <div className={styles.page}><div className={styles.loading}>Loading editor...</div></div>;

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Content Editor" subtitle={`Editing: ${contentType.replace(/_/g, ' ')}`} />
      <Link href="/admin/content/library" className={styles.backLink}>&larr; Back to Library</Link>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.statusBar}>
        <span className={`${styles.statusBadge} ${styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`] || ''}`}>{status}</span>
        <div className={styles.statusActions}>
          <Button size="sm" variant="ghost" onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'Hide Preview' : 'Preview'}</Button>
          {status === 'published' ? (
            <Button size="sm" variant="ghost" onClick={handleUnpublish}>Unpublish</Button>
          ) : (
            <Button size="sm" variant="primary" onClick={handlePublish}>Publish</Button>
          )}
          <Button size="sm" variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.editorPane}>
          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            <input className={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Variables</label>
            <div className={styles.variableBar}>
              {variables.map(v => (
                <button key={v} className={styles.varBtn} onClick={() => insertVariable(v)}>{`{{${v}}}`}</button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Body</label>
            <textarea className={styles.editor} value={body} onChange={(e) => setBody(e.target.value)} rows={18} spellCheck={false} />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Excerpt</label>
            <textarea className={styles.inputArea} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} placeholder="Short description..." />
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              <input className={styles.input} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Product Updates" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tags</label>
              <div className={styles.tagRow}>
                {tags.map(t => (
                  <span key={t} className={styles.tag}>{t}<button className={styles.tagRemove} onClick={() => removeTag(t)}>&times;</button></span>
                ))}
                <input
                  className={styles.tagInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); insertTag(tagInput); } }}
                  placeholder="Add tag..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidePane}>
          {showPreview && (
            <div className={styles.previewSection}>
              <h3 className={styles.sideTitle}>Preview</h3>
              <div className={styles.previewFrame} dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          )}

          <div className={styles.versionsSection}>
            <h3 className={styles.sideTitle}>Version History</h3>
            {versions.length === 0 ? (
              <p className={styles.emptyText}>No versions yet. Save to create first version.</p>
            ) : (
              versions.map((v) => (
                <div key={v.id} className={styles.versionItem}>
                  <div className={styles.versionInfo}>
                    <span className={styles.versionNum}>v{v.versionNumber}</span>
                    <span className={styles.versionDate}>{new Date(v.createdAt).toLocaleDateString()}</span>
                  </div>
                  {v.changeNote && <span className={styles.versionNote}>{v.changeNote}</span>}
                  <button className={styles.rollbackBtn} onClick={() => handleRollback(v.id)}>Restore</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
