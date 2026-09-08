import { NextRequest, NextResponse } from 'next/server';
import { getAllRoles, createRole, getAllPermissions } from '@/lib/db/rbac-queries';
import { withPermission } from '@/lib/security/rbac';

export const dynamic = 'force-dynamic';

export const GET = withPermission('roles', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('permissions') === 'true') {
      const perms = getAllPermissions();
      return NextResponse.json({ permissions: perms });
    }

    const rolesList = getAllRoles();
    return NextResponse.json({ roles: rolesList });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
});

export const POST = withPermission('roles', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const role = createRole({
      name: body.name,
      description: body.description,
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
  }
});
