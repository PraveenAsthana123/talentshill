'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useUIStore } from '@/store/ui-store';
import { cn } from '@/lib/utils';
import styles from '../AdminLeads.module.css';

interface Submission {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  company: string;
  role: string | null;
  industry: string;
  interestAreas: string[];
  projectStage: string;
  budgetRange: string | null;
  timeline: string;
  message: string;
  leadScore: number;
  leadTier: string;
  status: string;
  createdAt: string;
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const addToast = useUIStore((s) => s.addToast);
  const [lead, setLead] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/leads/${id}`)
      .then((r) => r.json())
      .then((data) => setLead(data.submission || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setLead(data.submission);
        addToast({ type: 'success', message: 'Status updated' });
      }
    } catch {
      addToast({ type: 'error', message: 'Failed to update' });
    }
    setUpdating(false);
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className="container section">Loading...</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className={styles.page}>
        <div className="container section">Lead not found.</div>
      </div>
    );
  }

  const tierClassName = `tier${lead.leadTier.charAt(0).toUpperCase() + lead.leadTier.slice(1)}` as keyof typeof styles;

  return (
    <div className={styles.page}>
      <div className="container section">
        <Link href="/admin/leads" className={styles.backLink}>
          &#8592; Back to Leads
        </Link>
        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 'var(--font-weight-bold)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {lead.fullName}
        </h1>

        <div className={styles.detailGrid}>
          <div>
            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Contact Information</div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Email</span>
                <span className={styles.detailValue}>{lead.email}</span>
              </div>
              {lead.phone && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Phone</span>
                  <span className={styles.detailValue}>{lead.phone}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Company</span>
                <span className={styles.detailValue}>{lead.company}</span>
              </div>
              {lead.role && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Role</span>
                  <span className={styles.detailValue}>{lead.role}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Industry</span>
                <span className={styles.detailValue}>{lead.industry}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Project Details</div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Interest Areas</span>
                <span className={styles.detailValue}>{lead.interestAreas.join(', ')}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Project Stage</span>
                <span className={styles.detailValue}>{lead.projectStage}</span>
              </div>
              {lead.budgetRange && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Budget</span>
                  <span className={styles.detailValue}>{lead.budgetRange}</span>
                </div>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Timeline</span>
                <span className={styles.detailValue}>{lead.timeline}</span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Message</div>
              <p
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 'var(--line-height-relaxed)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {lead.message}
              </p>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Lead Score</div>
              <div style={{ textAlign: 'center', padding: 'var(--space-4) 0' }}>
                <div
                  style={{
                    fontSize: 'var(--font-size-4xl)',
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-heading)',
                  }}
                >
                  {lead.leadScore}
                </div>
                <span className={cn(styles.tierBadge, styles[tierClassName])}>
                  {lead.leadTier.toUpperCase()}
                </span>
              </div>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Status</div>
              <select
                className={styles.statusSelect}
                value={lead.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className={styles.detailSection}>
              <div className={styles.detailTitle}>Metadata</div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Submitted</span>
                <span className={styles.detailValue}>
                  {new Date(lead.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
