import { NextRequest, NextResponse } from 'next/server';
import { getRoleById, updateRole, deleteRole, setRolePermissions } from '@/lib/db/rbac-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const dynamic = 'force-dynamic';

export const GET = withPermission('roles', 'read')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const role = getRoleById(id);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ role });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 });
  }
});

export const PATCH = withPermission('roles', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();

    const role = updateRole(id, {
      name: body.name,
      description: body.description,
    });

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (body.permissions && Array.isArray(body.permissions)) {
      setRolePermissions(id, body.permissions);
    }

    const updated = getRoleById(id);

    const triggeredBy = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'roles', operationName: 'update_role', executionMode: 'manual', status: 'completed',
      inputPayload: { id, fields: Object.keys(body) }, outputPayload: { id }, triggeredBy,
    });

    return NextResponse.json({ role: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
});

export const DELETE = withPermission('roles', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const success = deleteRole(id);
    if (!success) {
      return NextResponse.json({ error: 'Cannot delete system role or role not found' }, { status: 400 });
    }

    const triggeredBy = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'roles', operationName: 'delete_role', executionMode: 'manual', status: 'completed',
      inputPayload: { id }, outputPayload: { id }, triggeredBy,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
});
