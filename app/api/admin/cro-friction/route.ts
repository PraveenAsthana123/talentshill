import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recordFinding, markFixed, getReadinessSummary } from '@/lib/cro/friction-engine';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';

type RecordFindingType = 'slow_load' | 'confusing_cta' | 'broken_form' | 'unclear_pricing' | 'mobile_unusable' | 'trust_signal_missing' | 'other';

export const GET = withPermission('cro_friction', 'read')(async (_request: NextRequest, _context: unknown) => {
  const findings = db.select().from(schema.croFrictionFinding).orderBy(desc(schema.croFrictionFinding.observedAt)).all();
  return NextResponse.json({ ...getReadinessSummary(), findings });
});

export const POST = withPermission('cro_friction', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { pageUrl?: string; frictionType?: string; severity?: number; description?: string } | null;
  if (!body?.pageUrl || !body.frictionType || body.severity === undefined || !body.description) {
    return NextResponse.json({ error: 'pageUrl, frictionType, severity, and description are required' }, { status: 400 });
  }
  try {
    const id = recordFinding({ pageUrl: body.pageUrl, frictionType: body.frictionType as RecordFindingType, severity: body.severity, description: body.description, observedBy: 'admin' });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to record finding' }, { status: 400 });
  }
});

export const PATCH = withPermission('cro_friction', 'update')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  markFixed(body.id);
  return NextResponse.json({ ok: true });
});
