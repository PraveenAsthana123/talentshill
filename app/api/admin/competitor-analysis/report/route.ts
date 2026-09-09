import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

// Generated report document -- compiles existing real data (services +
// entries) into a readable summary. Does not compute or invent anything
// not already in the database.
export const GET = withPermission('competitor_analysis', 'read')(async (_request: NextRequest, _context: unknown) => {
  const services = db.select().from(schema.services).where(eq(schema.services.isActive, true)).all();
  const entries = db.select().from(schema.competitorAnalysis).all().filter((e) => !e.isTemplate);

  const byService = services.map((s) => ({
    service: { id: s.id, name: s.name, category: s.category },
    entries: entries.filter((e) => e.serviceId === s.id).map((e) => ({
      competitorName: e.competitorName,
      competitorWebsite: e.competitorWebsite,
      offeringSummary: e.offeringSummary,
      pricingNotes: e.pricingNotes,
      strengthsWeaknesses: e.strengthsWeaknesses,
      status: e.status,
      sampleDeliverables: e.sampleDeliverables ? JSON.parse(e.sampleDeliverables) : [],
    })),
  }));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalServices: services.length,
    servicesWithResearch: byService.filter((b) => b.entries.length > 0).length,
    byService,
  });
});
