import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('features', 'read')(async () => {
  const all = db.select().from(schema.featureFlags).all();
  const versions = db.select().from(schema.featureFlagVersions).all();
  const flagsWithHistory = new Set(versions.map((v) => v.flagId));
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'features')).all();
  const scored = all.filter((f) => f.readinessScore !== null && f.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalFlags: all.length,
      enabled: all.filter((f) => f.isEnabled).length,
      withoutHistory: all.filter((f) => !flagsWithHistory.has(f.id)).length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, f) => s + (f.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byModule: all.reduce((acc: Record<string, number>, f) => ({ ...acc, [f.module || 'unassigned']: (acc[f.module || 'unassigned'] ?? 0) + 1 }), {}),
  });
});
