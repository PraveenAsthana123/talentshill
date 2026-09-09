import { NextRequest, NextResponse } from 'next/server';
import { getAllServices, createService } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';
import { withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('services', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const services = getAllServices();
    return NextResponse.json({ services });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
});

export const POST = withPermission('services', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    if (!body.name || !body.category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }
    const service = createService(body);

    const token = request.cookies.get('admin_session')?.value;
    const userId = token ? (await verifyToken(token))?.userId ?? null : null;
    if (userId) {
      logAudit({ entityType: 'service', entityId: service.id, action: 'create', userId, metadata: { name: body.name } });
    }
    logOperationRun({
      moduleKey: 'services', operationName: 'create_service', executionMode: 'manual', status: 'completed',
      inputPayload: { name: body.name }, outputPayload: { id: service.id }, triggeredBy: userId,
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
});
