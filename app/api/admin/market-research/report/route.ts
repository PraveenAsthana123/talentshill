import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('market_research', 'read')(async () => {
  const all = db.select().from(schema.marketResearchBriefs).orderBy(desc(schema.marketResearchBriefs.readinessScore)).all();
  const ranked = db.select().from(schema.marketResearchBriefs)
    .orderBy(desc(schema.marketResearchBriefs.opportunityScore))
    .all()
    .filter((b) => b.opportunityScore !== null && b.opportunityScore !== undefined);
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalBriefs: all.length,
    briefs: all.map((b) => ({ title: b.title, topic: b.topic, status: b.status, readinessScore: b.readinessScore ?? null })),
    opportunityRanking: ranked.map((b) => ({
      rank: b.opportunityRank, title: b.title, opportunityScore: b.opportunityScore,
      somEstimateUsd: b.somEstimateUsd, competitionLevel: b.competitionLevel, riskLevel: b.riskLevel, strategicFitScore: b.strategicFitScore,
    })),
  });
});
