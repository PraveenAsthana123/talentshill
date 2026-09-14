import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('branding', 'read')(async () => {
  const all = db.select().from(schema.brandAssets).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'branding')).all();
  const scored = all.filter((a) => a.readinessScore !== null && a.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalAssets: all.length,
      approved: all.filter((a) => a.status === 'approved').length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, a) => s + (a.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byCategory: all.reduce((acc: Record<string, number>, a) => ({ ...acc, [a.category]: (acc[a.category] ?? 0) + 1 }), {}),
  });
});
