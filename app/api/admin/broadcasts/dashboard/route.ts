import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('broadcasts', 'read')(async () => {
  const all = db.select().from(schema.broadcasts).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'broadcasts')).all();
  const scored = all.filter((b) => b.readinessScore !== null && b.readinessScore !== undefined);
  const unscored = all.filter((b) => b.readinessScore === null || b.readinessScore === undefined);

  return NextResponse.json({
    kpis: {
      totalBroadcasts: all.length,
      draft: all.filter((b) => b.status === 'draft').length,
      sending: all.filter((b) => b.status === 'sending').length,
      completed: all.filter((b) => b.status === 'completed').length,
      unscored: unscored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, b) => s + (b.readinessScore || 0), 0) / scored.length) : 0,
      totalSent: all.reduce((s, b) => s + (b.totalSent || 0), 0),
      totalFailed: all.reduce((s, b) => s + (b.totalFailed || 0), 0),
      totalRuns: runs.length,
    },
    byStatus: all.reduce((acc: Record<string, number>, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }), {}),
  });
});
