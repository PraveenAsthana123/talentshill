import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('market_research', 'read')(async () => {
  const all = db.select().from(schema.marketResearchBriefs).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'market_research')).all();
  const scored = all.filter((b) => b.readinessScore !== null && b.readinessScore !== undefined);
  const opportunityScored = all.filter((b) => b.opportunityScore !== null && b.opportunityScore !== undefined);
  const topOpportunity = opportunityScored.length > 0
    ? opportunityScored.reduce((best, b) => (b.opportunityScore! > best.opportunityScore! ? b : best))
    : null;

  return NextResponse.json({
    kpis: {
      totalBriefs: all.length,
      published: all.filter((b) => b.status === 'published').length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, b) => s + (b.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
      opportunityScoredCount: opportunityScored.length,
      avgOpportunityScore: opportunityScored.length > 0 ? Math.round(opportunityScored.reduce((s, b) => s + (b.opportunityScore || 0), 0) / opportunityScored.length) : 0,
      topOpportunity: topOpportunity ? { title: topOpportunity.title, opportunityScore: topOpportunity.opportunityScore, opportunityRank: topOpportunity.opportunityRank } : null,
    },
    byStatus: all.reduce((acc: Record<string, number>, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }), {}),
  });
});
