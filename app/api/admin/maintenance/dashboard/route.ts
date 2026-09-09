import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc, eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';
import { getMaintenanceStatus } from '@/lib/ops/maintenance';

export const GET = withPermission('maintenance', 'read')(async () => {
  const status = getMaintenanceStatus();
  const latest = db.select().from(schema.maintenanceChecks).orderBy(desc(schema.maintenanceChecks.createdAt)).limit(1).get();
  const history = db.select().from(schema.maintenanceChecks).orderBy(desc(schema.maintenanceChecks.createdAt)).limit(20).all();
  const totalRuns = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'maintenance')).all().length;

  return NextResponse.json({
    kpis: {
      currentlyEnabled: status.enabled,
      latestCheckScore: latest?.score ?? null,
      latestCheckAt: latest?.createdAt ?? null,
      totalChecks: history.length,
      totalRuns,
    },
    history: history.map((h) => ({ id: h.id, score: h.score, enabled: h.enabled, enforcementMatchesExpected: h.enforcementMatchesExpected, observedStatusCode: h.observedStatusCode, createdAt: h.createdAt })),
  });
});
