'use client';

import { useState, useEffect, use } from 'react';
import styles from './AdminTemplateEditor.module.css';

export default function TemplateEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [template, setTemplate] = useState<any>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const [subject, setSubject] = useState('');
  const [name, setName] = useState('');
  const [versions, setVersions] = useState<any[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const variables = ['firstName', 'lastName', 'email', 'company', 'unsubscribeUrl'];

  useEffect(() => {
    fetch(`/api/admin/templates/${id}`)
      .then(r => r.json())
      .then(data => {
        setTemplate(data);
        setHtmlContent(data.htmlContent || '');
        setSubject(data.subject || '');
        setName(data.name || '');
      });
    fetch(`/api/admin/templates/${id}?versions=true`)
      .then(r => r.json())
      .then(data => { if (data.versions) setVersions(data.versions); });
  }, [id]);

  const insertVariable = (v: string) => {
    setHtmlContent(prev => prev + `{{${v}}}`);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await fetch(`/api/admin/templates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, htmlContent }),
      });
      setMessage('Template saved');
    } catch { setMessage('Error saving'); }
    setSaving(false);
  };

  const handlePreview = async () => {
    try {
      const res = await fetch(`/api/admin/templates/${id}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variables: { firstName: 'John', lastName: 'Doe', email: 'john@example.com', company: 'Acme Inc' } }),
      });
      const data = await res.json();
      setPreviewHtml(data.html || htmlContent);
      setShowPreview(true);
    } catch {
      setPreviewHtml(htmlContent);
      setShowPreview(true);
    }
  };

  const handleTestSend = async () => {
    if (!testEmail) return;
    setMessage('Sending...');
    try {
      const res = await fetch(`/api/admin/templates/${id}/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testEmail }),
      });
      const data = await res.json();
      setMessage(data.success ? 'Test email sent!' : 'Failed to send');
    } catch { setMessage('Error sending test'); }
  };

  if (!template) return <div className={styles.loading}>Loading...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Template</h1>
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={handlePreview}>Preview</button>
          <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.layout}>
        <div className={styles.editorPane}>
          <div className={styles.field}>
            <label className={styles.label}>Name</label>
            <input className={styles.input} value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Subject</label>
            <input className={styles.input} value={subject} onChange={e => setSubject(e.target.value)} />
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
            <label className={styles.label}>HTML Content</label>
            <textarea
              className={styles.editor}
              value={htmlContent}
              onChange={e => setHtmlContent(e.target.value)}
              rows={20}
              spellCheck={false}
            />
          </div>

          <div className={styles.testSendRow}>
            <input className={styles.input} placeholder="Test email address" value={testEmail} onChange={e => setTestEmail(e.target.value)} />
            <button className={styles.btnSecondary} onClick={handleTestSend}>Send Test</button>
          </div>
        </div>

        <div className={styles.sidePane}>
          {showPreview && (
            <div className={styles.previewSection}>
              <h3 className={styles.sideTitle}>Preview</h3>
              <div className={styles.previewFrame} dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          )}

          <div className={styles.versionsSection}>
            <h3 className={styles.sideTitle}>Version History</h3>
            {versions.length === 0 && <p className={styles.empty}>No versions yet</p>}
            {versions.map((v: any) => (
              <div key={v.id} className={styles.versionItem}>
                <span className={styles.versionNum}>v{v.version}</span>
                <span className={styles.versionDate}>{new Date(v.changedAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
