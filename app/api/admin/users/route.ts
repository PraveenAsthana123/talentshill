import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/db/admin-queries';
import { getUserRoles, setUserRoles } from '@/lib/db/rbac-queries';
import { hashPassword } from '@/lib/security/password';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const dynamic = 'force-dynamic';

export const GET = withPermission('users', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const usersList = getAllUsers();
    const usersWithRoles = usersList.map((user) => {
      const roles = getUserRoles(user.id);
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        roles,
      };
    });
    return NextResponse.json({ users: usersWithRoles });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});

export const POST = withPermission('users', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    if (!body.email || !body.password || !body.name) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const passwordHash = hashPassword(body.password);
    const user = createUser({
      email: body.email,
      passwordHash,
      name: body.name,
      role: body.role || 'editor',
    });

    if (body.roleIds && Array.isArray(body.roleIds)) {
      setUserRoles(user.id, body.roleIds);
    }

    const roles = getUserRoles(user.id);

    const triggeredBy = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'users', operationName: 'create_user', executionMode: 'manual', status: 'completed',
      inputPayload: { email: body.email }, outputPayload: { id: user.id }, triggeredBy,
    });

    return NextResponse.json({ user: { ...user, roles } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});
