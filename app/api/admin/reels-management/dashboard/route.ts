import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('reels_management', 'read')(async () => {
  const all = db.select().from(schema.reels).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'reels_management')).all();
  const scored = all.filter((r) => r.readinessScore !== null && r.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalReels: all.length,
      published: all.filter((r) => r.status === 'published').length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byPlatform: all.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.platform]: (acc[r.platform] ?? 0) + 1 }), {}),
    byStatus: all.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {}),
  });
});
