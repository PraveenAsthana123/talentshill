'use client';

import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import { useWorkflowStore } from '@/store/workflow-store';
import styles from './AdminWorkflow.module.css';

const STEPS = [
  'Select Content',
  'Select Asset',
  'Create Share Links',
  'Target Audience',
  'Configure Campaign',
  'Submit for Approval',
  'Monitor Progress',
  'View Results',
];

interface SelectItem { id: string; title: string; status?: string; name?: string; }

export default function AdminWorkflowPage() {
  const store = useWorkflowStore();
  const [contents, setContents] = useState<SelectItem[]>([]);
  const [assets, setAssets] = useState<SelectItem[]>([]);
  const [lists, setLists] = useState<SelectItem[]>([]);
  const [campaigns, setCampaigns] = useState<SelectItem[]>([]);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content?limit=100').then(r => r.json()).then(d => setContents(d.items || [])).catch(() => {});
    fetch('/api/admin/assets?limit=100').then(r => r.json()).then(d => setAssets(d.items || [])).catch(() => {});
    fetch('/api/admin/lists?limit=100').then(r => r.json()).then(d => setLists(d.items || d.lists || [])).catch(() => {});
    fetch('/api/admin/campaigns?limit=100').then(r => r.json()).then(d => setCampaigns(d.items || d.campaigns || [])).catch(() => {});
  }, []);

  const handleSaveWorkflow = async () => {
    setSaving(true);
    try {
      if (!store.workflowId) {
        const res = await fetch('/api/admin/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: store.workflowName || 'New Workflow' }),
        });
        const data = await res.json();
        if (data.id) store.setWorkflowId(data.id);
      }
      if (store.workflowId) {
        await fetch(`/api/admin/workflows/${store.workflowId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update-step',
            step: store.currentStep,
            contentId: store.contentId || undefined,
            assetId: store.assetId || undefined,
            shareLinkIds: store.shareLinkIds,
            listId: store.listId || undefined,
            campaignId: store.campaignId || undefined,
          }),
        });
      }
      setMessage('Progress saved');
      setTimeout(() => setMessage(''), 2000);
    } catch { setMessage('Error saving'); }
    setSaving(false);
  };

  const handleSubmitApproval = async () => {
    if (!store.workflowId) return;
    try {
      await fetch(`/api/admin/workflows/${store.workflowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-status', status: 'pending_approval' }),
      });
      store.setApprovalStatus('pending_approval');
      setMessage('Submitted for approval');
    } catch { setMessage('Error submitting'); }
  };

  const renderStepContent = () => {
    switch (store.currentStep) {
      case 0:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Select or Create Content</h3>
            <select className={styles.select} value={store.contentId || ''} onChange={(e) => store.setContentId(e.target.value || null)}>
              <option value="">-- Select content --</option>
              {contents.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <p className={styles.hint}>Or <a href="/admin/content/editor/new" target="_blank" rel="noreferrer">create new content</a></p>
          </div>
        );
      case 1:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Select or Create Asset</h3>
            <select className={styles.select} value={store.assetId || ''} onChange={(e) => store.setAssetId(e.target.value || null)}>
              <option value="">-- Select asset --</option>
              {assets.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
            <p className={styles.hint}>Or create a <a href="/admin/content/brochures" target="_blank" rel="noreferrer">brochure</a> or <a href="/admin/content/presentations" target="_blank" rel="noreferrer">presentation</a></p>
          </div>
        );
      case 2:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Create Share Links</h3>
            <p className={styles.hint}>Create share links from the <a href="/admin/content/links" target="_blank" rel="noreferrer">Share Links</a> page and add their IDs.</p>
            {store.shareLinkIds.length > 0 && (
              <div className={styles.chipList}>
                {store.shareLinkIds.map(id => (
                  <span key={id} className={styles.chip}>{id.slice(0, 8)}... <button className={styles.chipRemove} onClick={() => store.removeShareLinkId(id)}>&times;</button></span>
                ))}
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Select Target Audience</h3>
            <select className={styles.select} value={store.listId || ''} onChange={(e) => store.setListId(e.target.value || null)}>
              <option value="">-- Select list/segment --</option>
              {lists.map(l => <option key={l.id} value={l.id}>{l.name || l.title}</option>)}
            </select>
          </div>
        );
      case 4:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Configure Campaign</h3>
            <select className={styles.select} value={store.campaignId || ''} onChange={(e) => store.setCampaignId(e.target.value || null)}>
              <option value="">-- Select existing campaign --</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name || c.title}</option>)}
            </select>
            <p className={styles.hint}>Or <a href="/admin/campaigns/new" target="_blank" rel="noreferrer">create a new campaign</a></p>
          </div>
        );
      case 5:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Submit for Approval</h3>
            <p className={styles.hint}>Review all selections above and submit the workflow for approval.</p>
            <p className={styles.statusText}>Status: <strong>{store.approvalStatus}</strong></p>
            {store.approvalStatus === 'draft' || store.approvalStatus === 'in_progress' ? (
              <Button variant="primary" onClick={handleSubmitApproval}>Submit for Approval</Button>
            ) : (
              <p className={styles.hint}>Workflow has been submitted. Waiting for approval.</p>
            )}
          </div>
        );
      case 6:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>Monitor Progress</h3>
            <p className={styles.hint}>Once the campaign is running, monitor progress from the <a href="/admin/marketing/monitor" target="_blank" rel="noreferrer">Monitor Dashboard</a>.</p>
          </div>
        );
      case 7:
        return (
          <div className={styles.stepContent}>
            <h3 className={styles.stepTitle}>View Results</h3>
            <p className={styles.hint}>View detailed campaign analytics from the <a href="/admin/analytics/campaigns" target="_blank" rel="noreferrer">Campaign Analytics</a> page.</p>
            <Button variant="ghost" onClick={() => store.reset()}>Start New Workflow</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Marketing Workflow" subtitle="8-step wizard to create and launch marketing campaigns." />

      {message && <div className={styles.message}>{message}</div>}

      <div className={styles.nameBar}>
        <input className={styles.nameInput} value={store.workflowName} onChange={(e) => store.setWorkflowName(e.target.value)} placeholder="Workflow name..." />
        <Button size="sm" variant="ghost" onClick={handleSaveWorkflow} disabled={saving}>{saving ? 'Saving...' : 'Save Progress'}</Button>
      </div>

      <div className={styles.stepIndicators}>
        {STEPS.map((label, i) => (
          <button
            key={i}
            className={`${styles.stepIndicator} ${i === store.currentStep ? styles.stepActive : ''} ${i < store.currentStep ? styles.stepDone : ''}`}
            onClick={() => store.setStep(i)}
          >
            <span className={styles.stepNum}>{i + 1}</span>
            <span className={styles.stepLabel}>{label}</span>
          </button>
        ))}
      </div>

      <div className={styles.stepCard}>
        {renderStepContent()}
      </div>

      <div className={styles.navButtons}>
        <Button variant="ghost" onClick={() => store.prevStep()} disabled={store.currentStep === 0}>Previous</Button>
        <Button variant="primary" onClick={() => { handleSaveWorkflow(); store.nextStep(); }} disabled={store.currentStep === 7}>Next</Button>
      </div>
    </div>
  );
}
