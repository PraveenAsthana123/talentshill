import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';

export const GET = withPermission('competitor_analysis', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const row = db.select().from(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.id, id)).get();
  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({
    entry: { ...row, sampleDeliverables: row.sampleDeliverables ? JSON.parse(row.sampleDeliverables) : [] },
  });
});

export const PATCH = withPermission('competitor_analysis', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const existing = db.select().from(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  const userId = await getSessionUserIdAsync(request);
  const now = new Date();
  const updates: Record<string, unknown> = { updatedAt: now };
  for (const key of ['competitorName', 'competitorWebsite', 'offeringSummary', 'pricingNotes', 'strengthsWeaknesses', 'status'] as const) {
    if (body[key] !== undefined) updates[key] = body[key];
  }
  if (body.sampleDeliverables !== undefined) updates.sampleDeliverables = JSON.stringify(body.sampleDeliverables);
  if (body.status === 'researched') {
    updates.lastResearchedAt = now;
    updates.researchedBy = userId || null;
  }

  const row = db.update(schema.competitorAnalysis).set(updates).where(eq(schema.competitorAnalysis.id, id)).returning().get();
  return NextResponse.json({ entry: row });
});

export const DELETE = withPermission('competitor_analysis', 'delete')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const existing = db.select().from(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.id, id)).get();
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  db.delete(schema.competitorAnalysis).where(eq(schema.competitorAnalysis.id, id)).run();
  return NextResponse.json({ success: true });
});
