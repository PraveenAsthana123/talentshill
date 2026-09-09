import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc, eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('analytics', 'read')(async () => {
  const latest = db.select().from(schema.analyticsSnapshots).orderBy(desc(schema.analyticsSnapshots.createdAt)).limit(1).get();
  const history = db.select().from(schema.analyticsSnapshots).orderBy(desc(schema.analyticsSnapshots.createdAt)).limit(20).all();
  const totalRuns = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'analytics')).all().length;

  return NextResponse.json({
    kpis: {
      latestHealthScore: latest?.healthScore ?? null,
      latestSnapshotAt: latest?.createdAt ?? null,
      totalSnapshots: history.length,
      totalRuns,
    },
    history: history.map((h) => ({ id: h.id, healthScore: h.healthScore, openRateScore: h.openRateScore, clickRateScore: h.clickRateScore, bounceRateScore: h.bounceRateScore, contactHealthScore: h.contactHealthScore, createdAt: h.createdAt })),
  });
});
