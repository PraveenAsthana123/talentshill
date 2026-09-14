import { registerReportResolver } from '@/lib/report-share/registry';
import { getCampaignById, getCampaignVariants } from '@/lib/db/campaign-queries';

// Aggregate campaign performance only -- never individual recipient
// emails/contact details, same PII discipline as the leads resolver.
registerReportResolver('campaigns', 'campaign_summary', async (entityId) => {
  if (!entityId) return null;
  const campaign = getCampaignById(entityId);
  if (!campaign) return null;
  const variants = getCampaignVariants(entityId);

  return {
    title: `Campaign Report: ${campaign.name}`,
    generatedAt: new Date().toISOString(),
    data: {
      name: campaign.name,
      status: campaign.status,
      audienceCount: campaign.audienceCount,
      totalSent: campaign.totalSent,
      totalOpened: campaign.totalOpened,
      totalClicked: campaign.totalClicked,
      totalBounced: campaign.totalBounced,
      totalUnsubscribed: campaign.totalUnsubscribed,
      variants: variants.map((v) => ({ name: v.name, subject: v.subject, openCount: v.openCount, clickCount: v.clickCount })),
    },
  };
});
