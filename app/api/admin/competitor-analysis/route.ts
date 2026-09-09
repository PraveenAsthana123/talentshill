import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { db, schema } from '@/lib/db/index';
import { eq, desc } from 'drizzle-orm';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

// Admin-only market-research intelligence. Never referenced from any
// public route -- see lib/db/schema.ts's comment on competitorAnalysis
// for why this must stay real research, not invented competitor data.
export const GET = withPermission('competitor_analysis', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');

  const rows = serviceId
    ? db.select().from(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.serviceId, serviceId)).orderBy(desc(schema.competitorAnalysis.updatedAt)).all()
    : db.select().from(schema.competitorAnalysis).orderBy(desc(schema.competitorAnalysis.updatedAt)).all();

  const parsed = rows.map((r) => ({
    ...r,
    sampleDeliverables: r.sampleDeliverables ? JSON.parse(r.sampleDeliverables) : [],
  }));

  return NextResponse.json({ entries: parsed });
});

export const POST = withPermission('competitor_analysis', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as {
    serviceId?: string; competitorName?: string; competitorWebsite?: string;
    offeringSummary?: string; pricingNotes?: string; strengthsWeaknesses?: string;
    sampleDeliverables?: { name: string; description: string }[]; status?: string;
  } | null;

  if (!body?.serviceId || !body?.competitorName) {
    return NextResponse.json({ error: 'serviceId and competitorName are required' }, { status: 400 });
  }

  const service = db.select().from(schema.services).where(eq(schema.services.id, body.serviceId)).get();
  if (!service) {
    return NextResponse.json({ error: 'serviceId does not reference a real service' }, { status: 400 });
  }

  const userId = await getSessionUserIdAsync(request);
  const now = new Date();
  const row = db.insert(schema.competitorAnalysis).values({
    id: randomUUID(),
    serviceId: body.serviceId,
    competitorName: body.competitorName,
    competitorWebsite: body.competitorWebsite || null,
    offeringSummary: body.offeringSummary || null,
    pricingNotes: body.pricingNotes || null,
    strengthsWeaknesses: body.strengthsWeaknesses || null,
    sampleDeliverables: body.sampleDeliverables ? JSON.stringify(body.sampleDeliverables) : null,
    status: (body.status as 'needs_research' | 'researched' | 'monitoring') || 'needs_research',
    isTemplate: false,
    lastResearchedAt: body.status === 'researched' ? now : null,
    researchedBy: userId || null,
    createdAt: now,
    updatedAt: now,
  }).returning().get();

  logOperationRun({
    moduleKey: 'competitor_analysis',
    operationName: 'create_entry',
    executionMode: 'manual',
    status: 'completed',
    inputPayload: { serviceId: body.serviceId, competitorName: body.competitorName },
    outputPayload: { id: row.id },
    triggeredBy: userId,
  });

  return NextResponse.json({ entry: row }, { status: 201 });
});
