import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq, desc, and } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

// Shared operation-run history for any module adopting the Operational
// Portal Page & Tab Standard (competitor_analysis, leads, more to come).
// Gated on the generic 'health' resource, not any one module's resource
// -- gating this on competitor_analysis:read was a real bug (fixed here):
// a role with only leads:read would incorrectly get 403 on its own
// module's operation history via this shared endpoint.
export const GET = withPermission('health', 'read')(async (request: NextRequest, _context: unknown) => {
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
