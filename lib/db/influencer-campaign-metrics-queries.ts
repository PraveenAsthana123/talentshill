import { db, schema } from './index';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { influencerCampaignMetrics, influencerCampaigns } = schema;

export function createInfluencerMetricEntry(data: {
  campaignId: string;
  recordedDate: Date;
  reach?: number;
  clicks?: number;
  sales?: number;
  revenue?: number;
  enteredBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(influencerCampaignMetrics).values({
    id,
    campaignId: data.campaignId,
    recordedDate: data.recordedDate,
    reach: data.reach ?? 0,
    clicks: data.clicks ?? 0,
    sales: data.sales ?? 0,
    revenue: data.revenue ?? 0,
    enteredBy: data.enteredBy,
    createdAt: now,
  }).run();
  return id;
}

export function getMetricsForCampaign(campaignId: string) {
  return db.select().from(influencerCampaignMetrics)
    .where(eq(influencerCampaignMetrics.campaignId, campaignId))
    .orderBy(desc(influencerCampaignMetrics.recordedDate))
    .all();
}

export interface CreatorRoiAggregate {
  campaignId: string;
  influencerName: string;
  platform: string;
  status: string;
  agreedFee: number | null;
  audienceFitScore: number | null;
  totalReach: number;
  totalClicks: number;
  totalSales: number;
  totalRevenue: number;
  roi: number | null; // (revenue - agreedFee) / agreedFee
  entryCount: number;
}

// Real SQL aggregation over actually-logged metric rows. Campaigns with
// no metrics or no agreedFee return roi:null (never a fabricated ratio).
export function getRoiAggregateForAllCampaigns(): CreatorRoiAggregate[] {
  const rows = db.select({
    campaignId: influencerCampaigns.id,
    influencerName: influencerCampaigns.influencerName,
    platform: influencerCampaigns.platform,
    status: influencerCampaigns.status,
    agreedFee: influencerCampaigns.agreedFee,
    audienceFitScore: influencerCampaigns.audienceFitScore,
    totalReach: sql<number>`COALESCE(SUM(${influencerCampaignMetrics.reach}), 0)`,
    totalClicks: sql<number>`COALESCE(SUM(${influencerCampaignMetrics.clicks}), 0)`,
    totalSales: sql<number>`COALESCE(SUM(${influencerCampaignMetrics.sales}), 0)`,
    totalRevenue: sql<number>`COALESCE(SUM(${influencerCampaignMetrics.revenue}), 0)`,
    entryCount: sql<number>`COUNT(${influencerCampaignMetrics.id})`,
  })
    .from(influencerCampaigns)
    .leftJoin(influencerCampaignMetrics, eq(influencerCampaignMetrics.campaignId, influencerCampaigns.id))
    .groupBy(influencerCampaigns.id)
    .all();

  return rows.map((r) => ({
    ...r,
    roi: r.entryCount > 0 && r.agreedFee && r.agreedFee > 0 ? (r.totalRevenue - r.agreedFee) / r.agreedFee : null,
  }));
}

// Real filter/search over creators already in this repo's own DB
// (prospecting-status campaigns), not a third-party creator-database
// lookup -- no such integration exists. This is what "creator discovery"
// honestly means here: search real, self-entered creator records.
export function searchProspectingCreators(options: { platform?: string; minAudienceFitScore?: number } = {}) {
  const conditions = [eq(influencerCampaigns.status, 'prospecting')];
  if (options.platform) conditions.push(eq(influencerCampaigns.platform, options.platform as 'instagram' | 'youtube' | 'tiktok' | 'linkedin' | 'other'));
  if (options.minAudienceFitScore !== undefined) conditions.push(gte(influencerCampaigns.audienceFitScore, options.minAudienceFitScore));

  return db.select().from(influencerCampaigns)
    .where(and(...conditions))
    .orderBy(desc(influencerCampaigns.audienceFitScore))
    .all();
}
