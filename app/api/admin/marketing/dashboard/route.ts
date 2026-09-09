import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('workflows', 'read')(async () => {
  const all = db.select().from(schema.marketingWorkflows).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'marketing')).all();
  const scored = all.filter((w) => w.readinessScore !== null && w.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalWorkflows: all.length,
      pendingApproval: all.filter((w) => w.status === 'pending_approval').length,
      approved: all.filter((w) => w.status === 'approved').length,
      completed: all.filter((w) => w.status === 'completed').length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, w) => s + (w.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byStatus: all.reduce((acc: Record<string, number>, w) => ({ ...acc, [w.status]: (acc[w.status] ?? 0) + 1 }), {}),
  });
});
