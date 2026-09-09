import { NextRequest, NextResponse } from 'next/server';
import { getServiceById, updateService, deleteService } from '@/lib/db/admin-queries';
import { logAudit } from '@/lib/db/admin-queries';
import { verifyToken } from '@/lib/security/session';
import { withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('services', 'read')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const service = getServiceById(id);
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ service });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
});

export const PATCH = withPermission('services', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const service = updateService(id, body);
    if (!service) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const token = request.cookies.get('admin_session')?.value;
    const userId = token ? (await verifyToken(token))?.userId ?? null : null;
    if (userId) {
      logAudit({ entityType: 'service', entityId: id, action: 'update', userId });
    }
    logOperationRun({
      moduleKey: 'services', operationName: 'update_service', executionMode: 'manual', status: 'completed',
      inputPayload: { id, fields: Object.keys(body) }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ service });
  } catch {
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
});

export const DELETE = withPermission('services', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const deleted = deleteService(id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const token = request.cookies.get('admin_session')?.value;
    const userId = token ? (await verifyToken(token))?.userId ?? null : null;
    if (userId) {
      logAudit({ entityType: 'service', entityId: id, action: 'delete', userId });
    }
    logOperationRun({
      moduleKey: 'services', operationName: 'delete_service', executionMode: 'manual', status: 'completed',
      inputPayload: { id }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
});
