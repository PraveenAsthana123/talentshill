'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui';
import styles from './AdminCompose.module.css';

interface EmailProfile { id: string; name: string; fromEmail: string; }
interface Template { id: string; name: string; subject: string; }

export default function AdminComposePage() {
  const [profiles, setProfiles] = useState<EmailProfile[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [form, setForm] = useState({ to: '', subject: '', html: '', profileId: '' });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/email-profiles').then(r => r.json()),
      fetch('/api/admin/templates').then(r => r.json()),
    ]).then(([pData, tData]) => {
      setProfiles(pData.profiles || []);
      setTemplates(tData.templates || []);
    }).catch(() => {});
  }, []);

  const handleTemplateSelect = async (templateId: string) => {
    if (!templateId) return;
    try {
      const res = await fetch(`/api/admin/templates/${templateId}`);
      const data = await res.json();
      if (data.template) {
        setForm(p => ({ ...p, subject: data.template.subject, html: data.template.htmlContent }));
      }
    } catch { /* empty */ }
  };

  const handleSend = async () => {
    if (!form.to || !form.subject || !form.html) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/email-compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setResult(data.success
        ? { success: true, message: 'Email sent successfully!' }
        : { success: false, message: data.error || 'Failed to send email' }
      );
    } catch {
      setResult({ success: false, message: 'Failed to send email' });
    }
    setSending(false);
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Operations" title="Compose Email" subtitle="Send a one-off email to any recipient." />

      <div className={styles.formCard}>
        <div className={styles.formGrid}>
          <div>
            <label className={styles.formLabel}>To (email)</label>
            <input className={styles.formInput} type="email" value={form.to} onChange={e => setForm(p => ({ ...p, to: e.target.value }))} placeholder="recipient@example.com" />
          </div>
          <div>
            <label className={styles.formLabel}>Profile (optional)</label>
            <select className={styles.formSelect} value={form.profileId} onChange={e => setForm(p => ({ ...p, profileId: e.target.value }))}>
              <option value="">Default Profile</option>
              {profiles.map(p => <option key={p.id} value={p.id}>{p.name} ({p.fromEmail})</option>)}
            </select>
          </div>
          <div>
            <label className={styles.formLabel}>Load from Template</label>
            <select className={styles.formSelect} onChange={e => handleTemplateSelect(e.target.value)}>
              <option value="">Select a template...</option>
              {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className={styles.formLabel}>Subject</label>
            <input className={styles.formInput} value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className={styles.formLabel}>HTML Content</label>
            <textarea className={styles.formTextarea} value={form.html} onChange={e => setForm(p => ({ ...p, html: e.target.value }))} />
          </div>
        </div>

        {result && (
          <div className={result.success ? styles.successMsg : styles.errorMsg}>
            {result.message}
          </div>
        )}

        <div className={styles.formActions}>
          <Button size="sm" onClick={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send Email'}
          </Button>
        </div>
      </div>
    </div>
  );
}
