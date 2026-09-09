'use client';

import { useState, useEffect } from 'react';
import styles from './AdminAnalytics.module.css';
import sharedStyles from './AnalyticsShared.module.css';

interface CampaignSummary {
  totalCampaigns: number;
  completedCampaigns: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  openRate: string;
  clickRate: string;
  bounceRate: string;
}

interface TopCampaign {
  id: string;
  name: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: string;
  clickRate: string;
}

interface ContactSummary {
  totalContacts: number;
  activeContacts: number;
  unsubscribed: number;
  bounced: number;
}

interface SourceItem { source: string; count: number; }
interface ScoreItem { bucket: string; count: number; }

export default function ManualTab() {
  const [campaignSummary, setCampaignSummary] = useState<CampaignSummary | null>(null);
  const [topCampaigns, setTopCampaigns] = useState<TopCampaign[]>([]);
  const [contactSummary, setContactSummary] = useState<ContactSummary | null>(null);
  const [sourceDistribution, setSourceDistribution] = useState<SourceItem[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<ScoreItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics/campaigns').then(r => r.json()),
      fetch('/api/admin/analytics/contacts').then(r => r.json()),
    ]).then(([cData, ctData]) => {
      setCampaignSummary(cData.summary || null);
      setTopCampaigns(cData.topCampaigns || []);
      setContactSummary(ctData.summary || null);
      setSourceDistribution(ctData.sourceDistribution || []);
      setScoreDistribution(ctData.scoreDistribution || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className={sharedStyles.subSection}>
        <h4>Goal &amp; objective</h4>
        <p>Roll up real campaign and contact performance from the Campaigns and Contacts modules — this module has no records of its own to create/edit/delete; all mutations happen in those modules.</p>
      </div>

      {loading ? <div className={styles.empty}>Loading analytics...</div> : (
        <div>
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Campaign Performance</h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}><div className={styles.metricValue}>{campaignSummary?.totalCampaigns || 0}</div><div className={styles.metricLabel}>Total Campaigns</div></div>
              <div className={styles.metricCard}><div className={styles.metricValue}>{campaignSummary?.totalSent || 0}</div><div className={styles.metricLabel}>Emails Sent</div></div>
              <div className={styles.metricCard}><div className={styles.metricValue}>{campaignSummary?.openRate || '0'}%</div><div className={styles.metricLabel}>Open Rate</div></div>
              <div className={styles.metricCard}><div className={styles.metricValue}>{campaignSummary?.clickRate || '0'}%</div><div className={styles.metricLabel}>Click Rate</div></div>
              <div className={styles.metricCard}><div className={styles.metricValue}>{campaignSummary?.bounceRate || '0'}%</div><div className={styles.metricLabel}>Bounce Rate</div></div>
            </div>
          </div>

          {topCampaigns.length > 0 && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Top Campaigns (by Open Rate)</h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Campaign</th><th>Sent</th><th>Opened</th><th>Clicked</th><th>Open Rate</th><th>Click Rate</th></tr></thead>
                  <tbody>
                    {topCampaigns.map(c => (
                      <tr key={c.id}>
                        <td className={styles.nameCell}>{c.name}</td>
                        <td>{c.sent}</td><td>{c.opened}</td><td>{c.clicked}</td>
                        <td><span className={styles.rateBadge}>{c.openRate}%</span></td>
                        <td><span className={styles.rateBadge}>{c.clickRate}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Contact Overview</h2>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCard}><div className={styles.metricValue}>{contactSummary?.totalContacts || 0}</div><div className={styles.metricLabel}>Total Contacts</div></div>
              <div className={styles.metricCard}><div className={styles.metricValue}>{contactSummary?.activeContacts || 0}</div><div className={styles.metricLabel}>Active</div></div>
              <div className={styles.metricCard}><div className={styles.metricValue}>{contactSummary?.unsubscribed || 0}</div><div className={styles.metricLabel}>Unsubscribed</div></div>
              <div className={styles.metricCard}><div className={styles.metricValue}>{contactSummary?.bounced || 0}</div><div className={styles.metricLabel}>Bounced</div></div>
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.distCard}>
              <h3 className={styles.distTitle}>Contact Sources</h3>
              {sourceDistribution.length === 0 ? <div className={styles.empty}>No data</div> : (
                <div className={styles.distList}>
                  {sourceDistribution.map(s => (<div key={s.source} className={styles.distItem}><span className={styles.distLabel}>{s.source || 'unknown'}</span><span className={styles.distValue}>{s.count}</span></div>))}
                </div>
              )}
            </div>
            <div className={styles.distCard}>
              <h3 className={styles.distTitle}>Lead Score Distribution</h3>
              {scoreDistribution.length === 0 ? <div className={styles.empty}>No data</div> : (
                <div className={styles.distList}>
                  {scoreDistribution.map(s => (<div key={s.bucket} className={styles.distItem}><span className={styles.distLabel}>{s.bucket}</span><span className={styles.distValue}>{s.count}</span></div>))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
