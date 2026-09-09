import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('industries', 'read')(async () => {
  const all = db.select().from(schema.industries).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'industries');
  const scored = all.filter((i) => i.contentScore !== null && i.contentScore !== undefined);
  const unscored = all.filter((i) => i.contentScore === null || i.contentScore === undefined);

  return NextResponse.json({
    kpis: {
      totalIndustries: all.length,
      active: all.filter((i) => i.isActive).length,
      inactive: all.filter((i) => !i.isActive).length,
      unscored: unscored.length,
      avgContentScore: scored.length > 0 ? Math.round(scored.reduce((s, i) => s + (i.contentScore || 0), 0) / scored.length) : 0,
      missingIcon: all.filter((i) => !i.icon).length,
      totalRuns: runs.length,
    },
  });
});
