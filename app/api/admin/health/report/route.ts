import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('health', 'read')(async () => {
  const history = db.select().from(schema.healthSnapshots).orderBy(desc(schema.healthSnapshots.createdAt)).limit(50).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalSnapshots: history.length,
    snapshots: history.map((h) => ({
      healthScore: h.healthScore, jobRunnerScore: h.jobRunnerScore, recentErrorsScore: h.recentErrorsScore,
      jobFailureRateScore: h.jobFailureRateScore, dbSizeScore: h.dbSizeScore, createdAt: h.createdAt,
    })),
  });
});
