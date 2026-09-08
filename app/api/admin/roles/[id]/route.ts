import { NextRequest, NextResponse } from 'next/server';
import { getRoleById, updateRole, deleteRole, setRolePermissions } from '@/lib/db/rbac-queries';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const role = getRoleById(id);
    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }
    return NextResponse.json({ role });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    return NextResponse.json({ role: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = deleteRole(id);
    if (!success) {
      return NextResponse.json({ error: 'Cannot delete system role or role not found' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}
