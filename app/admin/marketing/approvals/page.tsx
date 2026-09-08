'use client';

import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui';
import Button from '@/components/ui/Button';
import styles from './AdminApprovals.module.css';

interface Workflow { id: string; name: string; status: string; currentStep: number; contentId: string | null; assetId: string | null; createdBy: string | null; approvedBy: string | null; approvedAt: string | null; createdAt: string; updatedAt: string; }

export default function AdminApprovalsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending_approval');

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filter !== 'all') params.set('status', filter);
      const res = await fetch(`/api/admin/workflows?${params}`);
      const data = await res.json();
      setWorkflows(data.items || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  useEffect(() => { fetchWorkflows(); }, [filter]);

  const handleApprove = async (id: string) => {
    try {
      await fetch(`/api/admin/workflows/${id}/approve`, { method: 'POST' });
      fetchWorkflows();
    } catch { /* empty */ }
  };

  const handleReject = async (id: string) => {
    try {
      await fetch(`/api/admin/workflows/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update-status', status: 'draft' }),
      });
      fetchWorkflows();
    } catch { /* empty */ }
  };

  const statusClass = (s: string) => {
    const map: Record<string, string> = {
      draft: styles.statusDraft, pending_approval: styles.statusPending,
      approved: styles.statusApproved, running: styles.statusRunning,
      completed: styles.statusCompleted, cancelled: styles.statusCancelled,
    };
    return map[s] || styles.statusDraft;
  };

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Approvals" subtitle="Review and approve marketing workflows." />

      <div className={styles.tabs}>
        {['pending_approval', 'approved', 'all'].map(tab => (
          <button key={tab} className={`${styles.tab} ${filter === tab ? styles.tabActive : ''}`} onClick={() => setFilter(tab)}>
            {tab === 'all' ? 'All' : tab.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.empty}>Loading...</div>
      ) : workflows.length === 0 ? (
        <div className={styles.empty}>No workflows found.</div>
      ) : (
        <div className={styles.list}>
          {workflows.map(wf => (
            <div key={wf.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{wf.name}</h3>
                <span className={`${styles.statusBadge} ${statusClass(wf.status)}`}>{wf.status.replace(/_/g, ' ')}</span>
              </div>
              <div className={styles.cardMeta}>
                <span>Step {wf.currentStep + 1}/8</span>
                <span>Created: {new Date(wf.createdAt).toLocaleDateString()}</span>
                {wf.approvedBy && <span>Approved by: {wf.approvedBy}</span>}
                {wf.approvedAt && <span>Approved: {new Date(wf.approvedAt).toLocaleDateString()}</span>}
              </div>
              {wf.status === 'pending_approval' && (
                <div className={styles.cardActions}>
                  <Button size="sm" variant="primary" onClick={() => handleApprove(wf.id)}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleReject(wf.id)}>Reject</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
