import { db, schema } from './index';
import { eq, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const { adCampaignMetrics, adCampaigns } = schema;

export function createAdCampaignMetricEntry(data: {
  campaignId: string;
  recordedDate: Date;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: number;
  spendForPeriod?: number;
  enteredBy?: string;
}) {
  const id = randomUUID();
  const now = new Date();
  db.insert(adCampaignMetrics).values({
    id,
    campaignId: data.campaignId,
    recordedDate: data.recordedDate,
    impressions: data.impressions ?? 0,
    clicks: data.clicks ?? 0,
    conversions: data.conversions ?? 0,
    revenue: data.revenue ?? 0,
    spendForPeriod: data.spendForPeriod ?? 0,
    enteredBy: data.enteredBy,
    createdAt: now,
  }).run();
  return id;
}

export function getMetricsForCampaign(campaignId: string) {
  return db.select().from(adCampaignMetrics)
    .where(eq(adCampaignMetrics.campaignId, campaignId))
    .orderBy(desc(adCampaignMetrics.recordedDate))
    .all();
}

export interface CampaignAggregate {
  campaignId: string;
  name: string;
  platform: string;
  status: string;
  budget: number | null;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalSpend: number;
  ctr: number | null;
  cpa: number | null;
  roas: number | null;
  entryCount: number;
}

// Real SQL aggregation over actually-entered metric rows -- no numbers
// invented here. Campaigns with zero metric entries return null ratios
// (not 0, not a fabricated placeholder) so callers can distinguish
// "no data yet" from "data shows zero performance."
export function getAggregatedMetricsForAllCampaigns(): CampaignAggregate[] {
  const rows = db.select({
    campaignId: adCampaigns.id,
    name: adCampaigns.name,
    platform: adCampaigns.platform,
    status: adCampaigns.status,
    budget: adCampaigns.budget,
    totalImpressions: sql<number>`COALESCE(SUM(${adCampaignMetrics.impressions}), 0)`,
    totalClicks: sql<number>`COALESCE(SUM(${adCampaignMetrics.clicks}), 0)`,
    totalConversions: sql<number>`COALESCE(SUM(${adCampaignMetrics.conversions}), 0)`,
    totalRevenue: sql<number>`COALESCE(SUM(${adCampaignMetrics.revenue}), 0)`,
    totalSpend: sql<number>`COALESCE(SUM(${adCampaignMetrics.spendForPeriod}), 0)`,
    entryCount: sql<number>`COUNT(${adCampaignMetrics.id})`,
  })
    .from(adCampaigns)
    .leftJoin(adCampaignMetrics, eq(adCampaignMetrics.campaignId, adCampaigns.id))
    .groupBy(adCampaigns.id)
    .all();

  return rows.map((r) => ({
    ...r,
    ctr: r.totalImpressions > 0 ? r.totalClicks / r.totalImpressions : null,
    cpa: r.totalConversions > 0 ? r.totalSpend / r.totalConversions : null,
    roas: r.totalSpend > 0 ? r.totalRevenue / r.totalSpend : null,
  }));
}

export function getAggregatedMetricsForCampaign(campaignId: string): CampaignAggregate | null {
  const all = getAggregatedMetricsForAllCampaigns();
  return all.find((c) => c.campaignId === campaignId) ?? null;
}
