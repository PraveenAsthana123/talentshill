import { db, schema } from '@/lib/db/index';
import { sql, desc, eq } from 'drizzle-orm';

// Demo 2 -- AI Budget Optimizer across ad platforms. Real composition of
// the existing Ads Management module (ad_campaigns + ad_campaign_metrics).
// No live ad-platform API sync exists -- spend/impressions/clicks are
// real but manually entered from each platform's own reporting UI
// (disclosed on the existing module already; restated for this demo).
// ROAS/CPA are computed here from real entered metrics, not fabricated.
export function getPerformanceMarketingView() {
  const campaigns = db.select().from(schema.adCampaigns).orderBy(desc(schema.adCampaigns.updatedAt)).limit(10).all();

  const withRoas = campaigns.map((c) => {
    const metrics = db.select().from(schema.adCampaignMetrics).where(eq(schema.adCampaignMetrics.campaignId, c.id)).all();
    const totalSpend = c.spend ?? 0;
    const totalRevenue = metrics.reduce((s, m) => s + (m.revenue ?? 0), 0);
    const totalConversions = metrics.reduce((s, m) => s + (m.conversions ?? 0), 0);
    const roas = totalSpend > 0 ? Math.round((totalRevenue / totalSpend) * 100) / 100 : null;
    const cpa = totalConversions > 0 ? Math.round((totalSpend / totalConversions) * 100) / 100 : null;
    return { id: c.id, name: c.name, platform: c.platform, status: c.status, spend: c.spend, roas, cpa };
  });

  const byPlatform = db.select({ platform: schema.adCampaigns.platform, c: sql<number>`count(*)` })
    .from(schema.adCampaigns).groupBy(schema.adCampaigns.platform).all();

  return {
    campaigns: withRoas, byPlatform,
    gapsDisclosed: 'No live Google/Meta/LinkedIn Ads API sync exists -- spend/impressions/clicks/conversions are real but manually entered from each platform\'s own reporting UI. ROAS/CPA above are computed live from those real entries, not simulated.',
  };
}
