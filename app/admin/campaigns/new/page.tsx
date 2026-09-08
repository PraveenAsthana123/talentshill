'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminCampaignWizard.module.css';

const STEPS = ['Name', 'Audience', 'Template', 'Subject', 'Schedule', 'Throttle', 'Review'];

export default function CampaignWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [lists, setLists] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    audienceType: 'list' as 'list' | 'segment' | 'all',
    audienceId: '',
    templateId: '',
    emailProfileId: '',
    subject: '',
    enableAbTest: false,
    variantBSubject: '',
    scheduledAt: '',
    throttlePerMinute: 60,
  });

  useEffect(() => {
    fetch('/api/admin/lists').then(r => r.json()).then(d => setLists(Array.isArray(d) ? d : d.lists || []));
    fetch('/api/admin/templates').then(r => r.json()).then(d => setTemplates(Array.isArray(d) ? d : d.templates || []));
    fetch('/api/admin/email-profiles').then(r => r.json()).then(d => setProfiles(Array.isArray(d) ? d : d.profiles || []));
  }, []);

  const update = (key: string, value: any) => setForm(prev => ({ ...prev, [key]: value }));
  const canNext = () => {
    if (step === 0) return form.name.trim().length > 0;
    if (step === 1) return form.audienceType === 'all' || form.audienceId;
    if (step === 2) return !!form.templateId;
    if (step === 3) return form.subject.trim().length > 0;
    return true;
  };

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          audienceType: form.audienceType,
          audienceId: form.audienceId || undefined,
          templateId: form.templateId,
          emailProfileId: form.emailProfileId || undefined,
          subject: form.subject,
          throttlePerMinute: form.throttlePerMinute,
        }),
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/admin/campaigns/${data.id}`);
      } else {
        setError('Failed to create campaign');
      }
    } catch { setError('Error creating campaign'); }
    setCreating(false);
  };

  const selectedTemplate = templates.find((t: any) => t.id === form.templateId);
  const selectedList = lists.find((l: any) => l.id === form.audienceId);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Campaign</h1>

      <div className={styles.stepper}>
        {STEPS.map((s, i) => (
          <div key={s} className={`${styles.stepItem} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`}>
            <span className={styles.stepNum}>{i + 1}</span>
            <span className={styles.stepLabel}>{s}</span>
          </div>
        ))}
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.stepContent}>
        {step === 0 && (
          <div className={styles.stepPane}>
            <h2 className={styles.stepTitle}>Campaign Name</h2>
            <input className={styles.input} value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. March Newsletter" autoFocus />
          </div>
        )}

        {step === 1 && (
          <div className={styles.stepPane}>
            <h2 className={styles.stepTitle}>Select Audience</h2>
            <div className={styles.radioGroup}>
              {(['list', 'all'] as const).map(t => (
                <label key={t} className={styles.radioLabel}>
                  <input type="radio" name="audienceType" checked={form.audienceType === t} onChange={() => update('audienceType', t)} />
                  <span>{t === 'list' ? 'Specific List' : 'All Contacts'}</span>
                </label>
              ))}
            </div>
            {form.audienceType === 'list' && (
              <select className={styles.select} value={form.audienceId} onChange={e => update('audienceId', e.target.value)}>
                <option value="">Select a list...</option>
                {lists.map((l: any) => <option key={l.id} value={l.id}>{l.name} ({l.memberCount || 0})</option>)}
              </select>
            )}
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepPane}>
            <h2 className={styles.stepTitle}>Choose Template</h2>
            <div className={styles.templateGrid}>
              {templates.map((t: any) => (
                <div key={t.id} className={`${styles.templateCard} ${form.templateId === t.id ? styles.templateSelected : ''}`} onClick={() => update('templateId', t.id)}>
                  <div className={styles.templateName}>{t.name}</div>
                  <div className={styles.templateCategory}>{t.category || 'Uncategorized'}</div>
                </div>
              ))}
            </div>
            <div className={styles.field} style={{ marginTop: 'var(--space-4)' }}>
              <label className={styles.label}>Email Profile</label>
              <select className={styles.select} value={form.emailProfileId} onChange={e => update('emailProfileId', e.target.value)}>
                <option value="">Default Profile</option>
                {profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({p.fromEmail})</option>)}
              </select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepPane}>
            <h2 className={styles.stepTitle}>Subject Line</h2>
            <input className={styles.input} value={form.subject} onChange={e => update('subject', e.target.value)} placeholder="Email subject line" />
            <label className={styles.checkLabel} style={{ marginTop: 'var(--space-4)' }}>
              <input type="checkbox" checked={form.enableAbTest} onChange={e => update('enableAbTest', e.target.checked)} />
              <span>Enable A/B Test (split subject line)</span>
            </label>
            {form.enableAbTest && (
              <div className={styles.field} style={{ marginTop: 'var(--space-3)' }}>
                <label className={styles.label}>Variant B Subject</label>
                <input className={styles.input} value={form.variantBSubject} onChange={e => update('variantBSubject', e.target.value)} placeholder="Alternative subject line" />
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className={styles.stepPane}>
            <h2 className={styles.stepTitle}>Schedule</h2>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="schedule" checked={!form.scheduledAt} onChange={() => update('scheduledAt', '')} />
                <span>Send Immediately</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="schedule" checked={!!form.scheduledAt} onChange={() => update('scheduledAt', new Date().toISOString().slice(0, 16))} />
                <span>Schedule for Later</span>
              </label>
            </div>
            {form.scheduledAt && (
              <input type="datetime-local" className={styles.input} value={form.scheduledAt} onChange={e => update('scheduledAt', e.target.value)} />
            )}
          </div>
        )}

        {step === 5 && (
          <div className={styles.stepPane}>
            <h2 className={styles.stepTitle}>Throttle</h2>
            <p className={styles.hint}>Emails per minute (higher = faster delivery, may trigger spam filters)</p>
            <input type="number" className={styles.input} value={form.throttlePerMinute} onChange={e => update('throttlePerMinute', parseInt(e.target.value) || 60)} min={1} max={1000} />
          </div>
        )}

        {step === 6 && (
          <div className={styles.stepPane}>
            <h2 className={styles.stepTitle}>Review & Launch</h2>
            <div className={styles.reviewGrid}>
              <div className={styles.reviewItem}><span className={styles.reviewLabel}>Name</span><span>{form.name}</span></div>
              <div className={styles.reviewItem}><span className={styles.reviewLabel}>Audience</span><span>{form.audienceType === 'all' ? 'All Contacts' : selectedList?.name || form.audienceId}</span></div>
              <div className={styles.reviewItem}><span className={styles.reviewLabel}>Template</span><span>{selectedTemplate?.name || form.templateId}</span></div>
              <div className={styles.reviewItem}><span className={styles.reviewLabel}>Subject</span><span>{form.subject}</span></div>
              {form.enableAbTest && <div className={styles.reviewItem}><span className={styles.reviewLabel}>A/B Test</span><span>Variant B: {form.variantBSubject}</span></div>}
              <div className={styles.reviewItem}><span className={styles.reviewLabel}>Schedule</span><span>{form.scheduledAt || 'Immediately'}</span></div>
              <div className={styles.reviewItem}><span className={styles.reviewLabel}>Throttle</span><span>{form.throttlePerMinute}/min</span></div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        {step > 0 && <button className={styles.btnSecondary} onClick={() => setStep(s => s - 1)}>Back</button>}
        <div className={styles.spacer} />
        {step < STEPS.length - 1 ? (
          <button className={styles.btnPrimary} onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Next</button>
        ) : (
          <button className={styles.btnPrimary} onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating...' : 'Create Campaign'}
          </button>
        )}
      </div>
    </div>
  );
}
