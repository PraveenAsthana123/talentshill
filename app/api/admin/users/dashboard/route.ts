import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('users', 'read')(async () => {
  const all = db.select().from(schema.users).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'users');
  const userRoleRows = db.select().from(schema.userRoles).all();
  const usersWithRoles = new Set(userRoleRows.map((r) => r.userId));
  const scored = all.filter((u) => u.securityScore !== null && u.securityScore !== undefined);
  const unscored = all.filter((u) => u.securityScore === null || u.securityScore === undefined);

  return NextResponse.json({
    kpis: {
      totalUsers: all.length,
      active: all.filter((u) => u.isActive).length,
      inactive: all.filter((u) => !u.isActive).length,
      withNoRoles: all.filter((u) => !usersWithRoles.has(u.id)).length,
      unscored: unscored.length,
      avgSecurityScore: scored.length > 0 ? Math.round(scored.reduce((s, u) => s + (u.securityScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
  });
});
