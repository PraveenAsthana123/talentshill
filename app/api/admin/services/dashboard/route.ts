import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('services', 'read')(async () => {
  const all = db.select().from(schema.services).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'services');
  const scored = all.filter((s) => s.contentScore !== null && s.contentScore !== undefined);
  const unscored = all.filter((s) => s.contentScore === null || s.contentScore === undefined);

  return NextResponse.json({
    kpis: {
      totalServices: all.length,
      active: all.filter((s) => s.isActive).length,
      inactive: all.filter((s) => !s.isActive).length,
      unscored: unscored.length,
      avgContentScore: scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.contentScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byCategory: all.reduce((acc: Record<string, number>, s) => ({ ...acc, [s.category]: (acc[s.category] ?? 0) + 1 }), {}),
  });
});
