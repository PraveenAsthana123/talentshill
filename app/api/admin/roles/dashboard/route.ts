import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('roles', 'read')(async () => {
  const all = db.select().from(schema.roles).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'roles');
  const rolePermRows = db.select().from(schema.rolePermissions).all();
  const userRoleRows = db.select().from(schema.userRoles).all();
  const rolesWithPerms = new Set(rolePermRows.map((r) => r.roleId));
  const rolesInUse = new Set(userRoleRows.map((r) => r.roleId));
  const scored = all.filter((r) => r.hygieneScore !== null && r.hygieneScore !== undefined);
  const unscored = all.filter((r) => r.hygieneScore === null || r.hygieneScore === undefined);

  return NextResponse.json({
    kpis: {
      totalRoles: all.length,
      system: all.filter((r) => r.isSystem).length,
      custom: all.filter((r) => !r.isSystem).length,
      withNoPermissions: all.filter((r) => !rolesWithPerms.has(r.id)).length,
      unusedCustom: all.filter((r) => !r.isSystem && !rolesInUse.has(r.id)).length,
      unscored: unscored.length,
      avgHygieneScore: scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.hygieneScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
  });
});
