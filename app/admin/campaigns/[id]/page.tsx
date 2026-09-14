'use client';

import { useState, useEffect, use } from 'react';
import styles from './AdminCampaignDetail.module.css';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<any>(null);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const [materializing, setMaterializing] = useState(false);
  const [materializeResult, setMaterializeResult] = useState('');
  const [generatingVariant, setGeneratingVariant] = useState(false);
  const [variantResult, setVariantResult] = useState('');
  const [segmenting, setSegmenting] = useState(false);
  const [segmentResult, setSegmentResult] = useState('');
  const [shareUrl, setShareUrl] = useState('');

  const refresh = () => {
    fetch(`/api/admin/campaigns/${id}`).then(r => r.json()).then((d) => { setCampaign(d.campaign || d); setVariants(d.variants || []); });
    fetch(`/api/admin/campaigns/${id}/recipients`).then(r => r.json()).then(d => setRecipients(Array.isArray(d) ? d : d.recipients || []));
  };

  useEffect(() => { refresh(); }, [id]);

  const handleMaterialize = async () => {
    setMaterializing(true); setMaterializeResult('');
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/materialize-recipients/`, { method: 'POST' });
      const d = await res.json();
      setMaterializeResult(`${d.added} recipient(s) added, ${d.totalRecipients} total.`);
      refresh();
    } catch (e) { setMaterializeResult(String(e)); } finally { setMaterializing(false); }
  };

  const handleGenerateVariant = async () => {
    setGeneratingVariant(true); setVariantResult('');
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/generate-variant/`, { method: 'POST' });
      const d = await res.json();
      setVariantResult(d.fabricationWarning
        ? `Variant B created: "${d.variantBSubject}" -- WARNING: possible fabricated statistic, review before launch.`
        : `Variant B created: "${d.variantBSubject}"`);
      refresh();
    } catch (e) { setVariantResult(String(e)); } finally { setGeneratingVariant(false); }
  };

  const handleBehavioralSegmentation = async () => {
    setSegmenting(true); setSegmentResult('');
    try {
      const res = await fetch(`/api/admin/campaigns/${id}/behavioral-segmentation/`, { method: 'POST' });
      const d = await res.json();
      setSegmentResult(d.nurtureListId
        ? `${d.nonOpenerCount} non-opener(s) segmented into a new nurture list.`
        : `${d.nonOpenerCount} non-opener(s) -- no list created.`);
    } catch (e) { setSegmentResult(String(e)); } finally { setSegmenting(false); }
  };

  const handleShareLink = async () => {
    const res = await fetch('/api/admin/campaigns/share-link/', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ campaignId: id }),
    });
    const d = await res.json().catch(() => null);
    if (d?.url) setShareUrl(d.url);
  };

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
          <h2 className={styles.sectionTitle}>AI Personalized Email Campaign actions</h2>
        </div>
        <p>1. Materialize recipients from the audience (required before Launch actually sends to anyone). 2. Generate an AI A/B variant. 3. After sending, segment non-openers for a nurture follow-up. 4. Share a client-facing report link.</p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', margin: 'var(--space-3) 0' }}>
          <button onClick={handleMaterialize} disabled={materializing}>{materializing ? 'Materializing…' : 'Materialize Recipients'}</button>
          <button onClick={handleGenerateVariant} disabled={generatingVariant}>{generatingVariant ? 'Generating (30-60s)…' : 'Generate AI Variant B'}</button>
          <button onClick={handleBehavioralSegmentation} disabled={segmenting}>{segmenting ? 'Segmenting…' : 'Segment Non-Openers'}</button>
          <button onClick={handleShareLink}>Generate Client Link</button>
        </div>
        {materializeResult && <p>{materializeResult}</p>}
        {variantResult && <p>{variantResult}</p>}
        {segmentResult && <p>{segmentResult}</p>}
        {shareUrl && <p>Share this link: <code>{shareUrl}</code></p>}

        {variants.length > 0 && (
          <table className={styles.table}>
            <thead><tr><th>Variant</th><th>Subject</th><th>Recipients</th><th>Opens</th><th>Clicks</th></tr></thead>
            <tbody>
              {variants.map((v: any) => (
                <tr key={v.id}><td>{v.name}</td><td>{v.subject ?? '—'}</td><td>{v.recipientCount ?? 0}</td><td>{v.openCount ?? 0}</td><td>{v.clickCount ?? 0}</td></tr>
              ))}
            </tbody>
          </table>
        )}
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
