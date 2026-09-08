'use client';

import { useState, useEffect } from 'react';
import { SectionHeader } from '@/components/ui';
import styles from './AdminMonitor.module.css';

interface CampaignStat { id: string; name: string; status: string; totalRecipients: number; sent: number; delivered: number; opened: number; clicked: number; bounced: number; }

export default function AdminMonitorPage() {
  const [campaigns, setCampaigns] = useState<CampaignStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/admin/campaigns?status=sending&limit=20');
        const data = await res.json();
        const items = data.campaigns || data.items || [];
        const enriched = await Promise.all(
          items.map(async (c: any) => {
            try {
              const statsRes = await fetch(`/api/admin/campaigns/${c.id}/stats`);
              const stats = await statsRes.json();
              return { ...c, ...stats };
            } catch {
              return { ...c, totalRecipients: 0, sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 };
            }
          })
        );
        setCampaigns(enriched);
      } catch { /* empty */ }
      setLoading(false);
    };
    fetchCampaigns();
  }, []);

  const pct = (value: number, total: number) => total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className={styles.page}>
      <SectionHeader label="Marketing" title="Campaign Monitor" subtitle="Track active campaigns and email delivery funnel." />

      {loading ? (
        <div className={styles.empty}>Loading campaign data...</div>
      ) : campaigns.length === 0 ? (
        <div className={styles.empty}>No active campaigns. Start a campaign from the Workflow wizard.</div>
      ) : (
        <div className={styles.campaignList}>
          {campaigns.map(c => (
            <div key={c.id} className={styles.campaignCard}>
              <div className={styles.campaignHeader}>
                <h3 className={styles.campaignName}>{c.name}</h3>
                <span className={styles.campaignStatus}>{c.status}</span>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressRow}>
                  <span className={styles.progressLabel}>Sent</span>
                  <div className={styles.progressTrack}>
                    <div className={styles.progressFill} style={{ width: `${pct(c.sent, c.totalRecipients)}%` }} />
                  </div>
                  <span className={styles.progressValue}>{c.sent}/{c.totalRecipients}</span>
                </div>
              </div>

              <div className={styles.funnelSection}>
                <h4 className={styles.funnelTitle}>Email Funnel</h4>
                <div className={styles.funnel}>
                  <div className={styles.funnelStep}>
                    <span className={styles.funnelValue}>{c.sent}</span>
                    <span className={styles.funnelLabel}>Sent</span>
                  </div>
                  <span className={styles.funnelArrow}>&rarr;</span>
                  <div className={styles.funnelStep}>
                    <span className={styles.funnelValue}>{c.delivered}</span>
                    <span className={styles.funnelLabel}>Delivered</span>
                  </div>
                  <span className={styles.funnelArrow}>&rarr;</span>
                  <div className={styles.funnelStep}>
                    <span className={styles.funnelValue}>{c.opened}</span>
                    <span className={styles.funnelLabel}>Opened ({pct(c.opened, c.delivered)}%)</span>
                  </div>
                  <span className={styles.funnelArrow}>&rarr;</span>
                  <div className={styles.funnelStep}>
                    <span className={styles.funnelValue}>{c.clicked}</span>
                    <span className={styles.funnelLabel}>Clicked ({pct(c.clicked, c.opened)}%)</span>
                  </div>
                </div>
                {c.bounced > 0 && (
                  <div className={styles.bounceAlert}>
                    {c.bounced} bounced ({pct(c.bounced, c.sent)}%)
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
