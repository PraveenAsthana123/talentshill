import { NextRequest, NextResponse } from 'next/server';
import { getAllIndustries, createIndustry } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';
import { withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('industries', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const industries = getAllIndustries();
    return NextResponse.json({ industries });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch industries' }, { status: 500 });
  }
});

export const POST = withPermission('industries', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const industry = createIndustry(body);

    const token = request.cookies.get('admin_session')?.value;
    const userId = token ? (await verifyToken(token))?.userId ?? null : null;
    if (userId) {
      logAudit({ entityType: 'industry', entityId: industry.id, action: 'create', userId, metadata: { name: body.name } });
    }
    logOperationRun({
      moduleKey: 'industries', operationName: 'create_industry', executionMode: 'manual', status: 'completed',
      inputPayload: { name: body.name }, outputPayload: { id: industry.id }, triggeredBy: userId,
    });

    return NextResponse.json({ industry }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create industry' }, { status: 500 });
  }
});
