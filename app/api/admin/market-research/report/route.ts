import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('market_research', 'read')(async () => {
  const all = db.select().from(schema.marketResearchBriefs).orderBy(desc(schema.marketResearchBriefs.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalBriefs: all.length,
    briefs: all.map((b) => ({ title: b.title, topic: b.topic, status: b.status, readinessScore: b.readinessScore ?? null })),
  });
});
