import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('users', 'read')(async () => {
  const all = db.select().from(schema.users).orderBy(desc(schema.users.securityScore)).all();
  const userRoleRows = db.select().from(schema.userRoles).all();
  const roleRows = db.select().from(schema.roles).all();
  const roleNameById = new Map(roleRows.map((r) => [r.id, r.name]));

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalUsers: all.length,
    users: all.map((u) => ({
      name: u.name, email: u.email, isActive: u.isActive, securityScore: u.securityScore ?? null,
      roles: userRoleRows.filter((ur) => ur.userId === u.id).map((ur) => roleNameById.get(ur.roleId)).filter(Boolean),
    })),
  });
});
