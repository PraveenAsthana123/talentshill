import { db, schema } from '@/lib/db/index';
import { sql, desc } from 'drizzle-orm';

// Demo 5 -- Creator Discovery and Campaign ROI. Real composition of the
// existing Influencer Video module (influencer_campaigns +
// influencer_campaign_metrics). No creator-discovery/audience-data API
// integration exists -- audienceFitScore is real human judgment entered
// at prospecting time, not a third-party lookup (disclosed on the
// existing module already; restated here for the client-facing demo).
export function getSocialInfluencerView() {
  const campaigns = db.select().from(schema.influencerCampaigns).orderBy(desc(schema.influencerCampaigns.updatedAt)).limit(10).all();
  const byStatus = db.select({ status: schema.influencerCampaigns.status, c: sql<number>`count(*)` })
    .from(schema.influencerCampaigns).groupBy(schema.influencerCampaigns.status).all();
  const avgAudienceFit = db.select({ avg: sql<number | null>`avg(audience_fit_score)` }).from(schema.influencerCampaigns).get()?.avg ?? null;

  return {
    campaigns: campaigns.map((c) => ({ id: c.id, influencerName: c.influencerName, platform: c.platform, status: c.status, audienceFitScore: c.audienceFitScore, agreedFee: c.agreedFee })),
    byStatus,
    avgAudienceFit: avgAudienceFit === null ? null : Math.round(avgAudienceFit * 10) / 10,
    gapsDisclosed: 'No creator-discovery/audience-data API exists -- audienceFitScore is real human judgment, not an automated third-party lookup. No automated social-listening sentiment feed; campaignFeedbackNotes are manually entered.',
  };
}
