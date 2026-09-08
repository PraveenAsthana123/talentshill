import { NextRequest, NextResponse } from 'next/server';
import { getUserById, updateUser } from '@/lib/db/admin-queries';
import { getUserRoles, setUserRoles, getUserPermissions } from '@/lib/db/rbac-queries';
import { withPermission } from '@/lib/security/rbac';

export const dynamic = 'force-dynamic';

export const GET = withPermission('users', 'read')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const user = getUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const roles = getUserRoles(id);
    const perms = getUserPermissions(id);
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles,
        permissions: perms,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
});

export const PATCH = withPermission('users', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();

    const user = updateUser(id, {
      name: body.name,
      email: body.email,
      role: body.role,
      isActive: body.isActive,
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (body.roleIds && Array.isArray(body.roleIds)) {
      setUserRoles(id, body.roleIds);
    }

    const roles = getUserRoles(id);
    return NextResponse.json({ user: { ...user, roles } });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});

export const DELETE = withPermission('users', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const user = updateUser(id, { isActive: false });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'User deactivated' });
  } catch {
    return NextResponse.json({ error: 'Failed to deactivate user' }, { status: 500 });
  }
});
