'use client';

import { useState, useEffect, use } from 'react';
import styles from './AdminCampaignDetail.module.css';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetch(`/api/admin/campaigns/${id}`).then(r => r.json()).then(setCampaign);
    fetch(`/api/admin/campaigns/${id}/recipients`).then(r => r.json()).then(d => setRecipients(Array.isArray(d) ? d : d.recipients || []));
  }, [id]);

  if (!campaign) return <div className={styles.loading}>Loading...</div>;

  const stats = [
    { label: 'Sent', value: campaign.totalSent || 0, color: '#3b82f6' },
    { label: 'Opened', value: campaign.totalOpened || 0, color: '#22c55e' },
    { label: 'Clicked', value: campaign.totalClicked || 0, color: '#8b5cf6' },
    { label: 'Bounced', value: campaign.totalBounced || 0, color: '#ef4444' },
    { label: 'Unsubs', value: campaign.totalUnsubscribed || 0, color: '#f59e0b' },
  ];

  const openRate = campaign.totalSent > 0 ? ((campaign.totalOpened / campaign.totalSent) * 100).toFixed(1) : '0';
  const clickRate = campaign.totalOpened > 0 ? ((campaign.totalClicked / campaign.totalOpened) * 100).toFixed(1) : '0';

  const statusClass = (s: string) => {
    const map: Record<string, string> = { draft: styles.badgeDraft, sending: styles.badgeSending, completed: styles.badgeCompleted, paused: styles.badgePaused, cancelled: styles.badgeCancelled };
    return map[s] || styles.badgeDraft;
  };

  const filtered = statusFilter ? recipients.filter((r: any) => r.status === statusFilter) : recipients;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{campaign.name}</h1>
          <span className={`${styles.badge} ${statusClass(campaign.status)}`}>{campaign.status}</span>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map(s => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue} style={{ color: s.color }}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.ratesRow}>
        <div className={styles.rateCard}>
          <span className={styles.rateValue}>{openRate}%</span>
          <span className={styles.rateLabel}>Open Rate</span>
        </div>
        <div className={styles.rateCard}>
          <span className={styles.rateValue}>{clickRate}%</span>
          <span className={styles.rateLabel}>Click Rate</span>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recipients</h2>
          <select className={styles.filterSelect} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {['pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <table className={styles.table}>
          <thead>
            <tr><th>Contact</th><th>Status</th><th>Sent</th><th>Opened</th><th>Clicked</th></tr>
          </thead>
          <tbody>
            {filtered.map((r: any) => (
              <tr key={r.id}>
                <td>{r.contactId}</td>
                <td><span className={styles.recipientStatus}>{r.status}</span></td>
                <td>{r.sentAt ? new Date(r.sentAt).toLocaleString() : '-'}</td>
                <td>{r.openedAt ? new Date(r.openedAt).toLocaleString() : '-'}</td>
                <td>{r.clickedAt ? new Date(r.clickedAt).toLocaleString() : '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className={styles.empty}>No recipients</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
