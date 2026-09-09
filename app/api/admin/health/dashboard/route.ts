import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc, eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('health', 'read')(async () => {
  const latest = db.select().from(schema.healthSnapshots).orderBy(desc(schema.healthSnapshots.createdAt)).limit(1).get();
  const history = db.select().from(schema.healthSnapshots).orderBy(desc(schema.healthSnapshots.createdAt)).limit(20).all();
  const totalRuns = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'health')).all().length;

  return NextResponse.json({
    kpis: {
      latestHealthScore: latest?.healthScore ?? null,
      latestSnapshotAt: latest?.createdAt ?? null,
      totalSnapshots: history.length,
      totalRuns,
    },
    history: history.map((h) => ({ id: h.id, healthScore: h.healthScore, jobRunnerScore: h.jobRunnerScore, recentErrorsScore: h.recentErrorsScore, jobFailureRateScore: h.jobFailureRateScore, dbSizeScore: h.dbSizeScore, createdAt: h.createdAt })),
  });
});
