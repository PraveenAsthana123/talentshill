import { registerReportResolver } from '@/lib/report-share/registry';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';

// Aggregate-only -- competitor names/descriptions are the whole point
// of this real business intelligence, so unlike the PII-sensitive
// resolvers (leads/contacts/chat) this one includes real competitor
// names, matching the same disclosure tier as campaigns/content/
// branding. Never includes internal evidence URLs.
registerReportResolver('competitor_analysis', 'campaign_monitor_summary', async () => {
  const competitors = db.select().from(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.isTemplate, false)).all();
  const observations = db.select().from(schema.competitorCampaignObservations).all();
  const nameById = new Map(competitors.map((c) => [c.id, c.competitorName]));

  return {
    title: 'Competitor Campaign Monitor Summary',
    generatedAt: new Date().toISOString(),
    data: {
      totalCompetitors: competitors.length,
      totalObservations: observations.length,
      byChannel: observations.reduce((acc: Record<string, number>, o) => ({ ...acc, [o.channel]: (acc[o.channel] ?? 0) + 1 }), {}),
      byType: observations.reduce((acc: Record<string, number>, o) => ({ ...acc, [o.campaignType]: (acc[o.campaignType] ?? 0) + 1 }), {}),
      recentObservations: [...observations]
        .sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime())
        .slice(0, 10)
        .map((o) => ({ competitorName: nameById.get(o.competitorId) ?? 'unknown', observedAt: o.observedAt.toISOString(), channel: o.channel, campaignType: o.campaignType })),
    },
  };
});
