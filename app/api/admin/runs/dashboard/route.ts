import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('runs', 'read')(async () => {
  const all = db.select().from(schema.runs).all();
  const opRuns = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'runs')).all();
  const scored = all.filter((r) => r.healthScore !== null && r.healthScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalRuns: all.length,
      active: all.filter((r) => r.status === 'active').length,
      failed: all.filter((r) => r.status === 'failed').length,
      unscored: all.length - scored.length,
      avgHealthScore: scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.healthScore || 0), 0) / scored.length) : 0,
      totalOperationRuns: opRuns.length,
    },
    byType: all.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.type]: (acc[r.type] ?? 0) + 1 }), {}),
    byStatus: all.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {}),
  });
});
