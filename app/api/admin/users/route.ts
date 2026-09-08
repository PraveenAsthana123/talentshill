import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/lib/db/admin-queries';
import { getUserRoles, setUserRoles } from '@/lib/db/rbac-queries';
import { hashPassword } from '@/lib/security/password';

export const dynamic = 'force-dynamic';

export async function GET() {
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
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ user: { ...user, roles } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
