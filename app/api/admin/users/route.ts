import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAllUsers, createUser } from '@/lib/db/admin-queries';
import { getUserRoles, setUserRoles } from '@/lib/db/rbac-queries';
import { hashPassword } from '@/lib/security/password';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(200),
  role: z.enum(['admin', 'editor', 'viewer']).default('editor'),
  roleIds: z.array(z.string()).optional(),
});

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
    const parsed = CreateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const passwordHash = hashPassword(parsed.data.password);
    const user = createUser({
      email: parsed.data.email,
      passwordHash,
      name: parsed.data.name,
      role: parsed.data.role,
    });

    if (parsed.data.roleIds && parsed.data.roleIds.length > 0) {
      setUserRoles(user.id, parsed.data.roleIds);
    }

    const roles = getUserRoles(user.id);

    const triggeredBy = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'users', operationName: 'create_user', executionMode: 'manual', status: 'completed',
      inputPayload: { email: parsed.data.email }, outputPayload: { id: user.id }, triggeredBy,
    });

    return NextResponse.json({ user: { ...user, roles } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});
