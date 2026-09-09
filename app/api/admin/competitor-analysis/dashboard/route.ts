import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('competitor_analysis', 'read')(async (_request: NextRequest, _context: unknown) => {
  const services = db.select().from(schema.services).where(eq(schema.services.isActive, true)).all();
  const entries = db.select().from(schema.competitorAnalysis).all();
  const realEntries = entries.filter((e) => !e.isTemplate);

  const coveredServiceIds = new Set(realEntries.map((e) => e.serviceId));
  const servicesWithCoverage = services.filter((s) => coveredServiceIds.has(s.id));
  const servicesWithoutCoverage = services.filter((s) => !coveredServiceIds.has(s.id));

  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'competitor_analysis')).all();

  return NextResponse.json({
    kpis: {
      totalServices: services.length,
      servicesCovered: servicesWithCoverage.length,
      servicesUncovered: servicesWithoutCoverage.length,
      coveragePercent: services.length > 0 ? Math.round((servicesWithCoverage.length / services.length) * 100) : 0,
      totalRealEntries: realEntries.length,
      needsResearch: realEntries.filter((e) => e.status === 'needs_research').length,
      researched: realEntries.filter((e) => e.status === 'researched').length,
      monitoring: realEntries.filter((e) => e.status === 'monitoring').length,
      totalRuns: runs.length,
      aiDraftedPendingReview: realEntries.filter((e) => (e.offeringSummary || '').startsWith('[AI-drafted')).length,
    },
    uncoveredServices: servicesWithoutCoverage.map((s) => ({ id: s.id, name: s.name, category: s.category })),
  });
});
