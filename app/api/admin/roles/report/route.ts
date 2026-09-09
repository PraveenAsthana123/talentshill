import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('roles', 'read')(async () => {
  const all = db.select().from(schema.roles).orderBy(desc(schema.roles.hygieneScore)).all();
  const rolePermRows = db.select().from(schema.rolePermissions).all();
  const permCountByRole = new Map<string, number>();
  for (const r of rolePermRows) permCountByRole.set(r.roleId, (permCountByRole.get(r.roleId) ?? 0) + 1);

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalRoles: all.length,
    roles: all.map((r) => ({
      name: r.name, isSystem: r.isSystem, permissionCount: permCountByRole.get(r.id) ?? 0, hygieneScore: r.hygieneScore ?? null,
    })),
  });
});
