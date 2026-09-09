import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('maintenance', 'read')(async () => {
  const history = db.select().from(schema.maintenanceChecks).orderBy(desc(schema.maintenanceChecks.createdAt)).limit(50).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalChecks: history.length,
    checks: history.map((h) => ({
      score: h.score, enabled: h.enabled, enforcementMatchesExpected: h.enforcementMatchesExpected,
      observedStatusCode: h.observedStatusCode, createdAt: h.createdAt,
    })),
  });
});
