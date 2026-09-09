import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq, desc, and } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

// Shared operation-run history for any module adopting the Operational
// Portal Page & Tab Standard. Gated on the querying module's own RBAC
// resource via the moduleKey param -- competitor_analysis today, more
// later. Falls back to competitor_analysis's permission if no moduleKey
// given (this route currently only has one real consumer).
export const GET = withPermission('competitor_analysis', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const moduleKey = searchParams.get('moduleKey');
  const executionMode = searchParams.get('executionMode');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);

  const conditions = [];
  if (moduleKey) conditions.push(eq(schema.operationRun.moduleKey, moduleKey));
  if (executionMode) conditions.push(eq(schema.operationRun.executionMode, executionMode as 'manual' | 'pipeline' | 'agentic'));

  const runs = conditions.length
    ? db.select().from(schema.operationRun).where(and(...conditions)).orderBy(desc(schema.operationRun.createdAt)).limit(limit).all()
    : db.select().from(schema.operationRun).orderBy(desc(schema.operationRun.createdAt)).limit(limit).all();

  const parsed = runs.map((r) => ({
    ...r,
    inputPayload: r.inputPayload ? JSON.parse(r.inputPayload) : null,
    outputPayload: r.outputPayload ? JSON.parse(r.outputPayload) : null,
  }));

  return NextResponse.json({ runs: parsed, count: parsed.length });
});
