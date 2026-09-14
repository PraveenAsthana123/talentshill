import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';
import { getAggregatedMetricsForAllCampaigns } from '@/lib/db/ad-campaign-metrics-queries';

export const GET = withPermission('ads_management', 'read')(async () => {
  const all = db.select().from(schema.adCampaigns).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'ads_management')).all();
  const scored = all.filter((c) => c.readinessScore !== null && c.readinessScore !== undefined);

  const aggregates = getAggregatedMetricsForAllCampaigns();
  const withRoas = aggregates.filter((a) => a.roas !== null);

  return NextResponse.json({
    kpis: {
      totalCampaigns: all.length,
      active: all.filter((c) => c.status === 'active').length,
      totalBudget: all.reduce((s, c) => s + (c.budget || 0), 0),
      totalSpend: all.reduce((s, c) => s + (c.spend || 0), 0),
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, c) => s + (c.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
      campaignsWithMetrics: aggregates.filter((a) => a.entryCount > 0).length,
      avgRoas: withRoas.length > 0 ? Number((withRoas.reduce((s, a) => s + (a.roas || 0), 0) / withRoas.length).toFixed(2)) : null,
    },
    byPlatform: all.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.platform]: (acc[c.platform] ?? 0) + 1 }), {}),
  });
});
