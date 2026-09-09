import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('content_overrides', 'read')(async () => {
  const all = db.select().from(schema.contentOverrides).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'content_overrides')).all();
  const scored = all.filter((o) => o.safetyScore !== null && o.safetyScore !== undefined);
  const unscored = all.filter((o) => o.safetyScore === null || o.safetyScore === undefined);

  return NextResponse.json({
    kpis: {
      totalOverrides: all.length,
      active: all.filter((o) => o.isActive).length,
      inactive: all.filter((o) => !o.isActive).length,
      unscored: unscored.length,
      avgSafetyScore: scored.length > 0 ? Math.round(scored.reduce((s, o) => s + (o.safetyScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byPage: all.reduce((acc: Record<string, number>, o) => ({ ...acc, [o.pageSlug]: (acc[o.pageSlug] ?? 0) + 1 }), {}),
  });
});
