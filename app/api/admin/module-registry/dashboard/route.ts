import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('health', 'read')(async () => {
  const all = db.select().from(schema.moduleRegistry).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'module-registry')).all();
  const scored = all.filter((m) => m.driftScore !== null && m.driftScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalModules: all.length,
      cataloged: all.filter((m) => m.builtStatus !== 'not_yet_cataloged').length,
      unscored: all.length - scored.length,
      avgDriftScore: scored.length > 0 ? Math.round(scored.reduce((s, m) => s + (m.driftScore || 0), 0) / scored.length) : 0,
      neverVerified: all.filter((m) => !m.lastVerifiedAt).length,
      totalRuns: runs.length,
    },
    byBuiltStatus: all.reduce((acc: Record<string, number>, m) => ({ ...acc, [m.builtStatus]: (acc[m.builtStatus] ?? 0) + 1 }), {}),
  });
});
