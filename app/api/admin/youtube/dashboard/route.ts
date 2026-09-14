import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('youtube', 'read')(async () => {
  const all = db.select().from(schema.youtubeVideos).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'youtube')).all();
  const scored = all.filter((v) => v.readinessScore !== null && v.readinessScore !== undefined);
  const snapshots = db.select().from(schema.youtubeChannelSnapshots).all();
  const latestSnapshot = snapshots.length > 0 ? snapshots.reduce((a, b) => (a.snapshotDate > b.snapshotDate ? a : b)) : null;

  return NextResponse.json({
    kpis: {
      totalVideos: all.length,
      published: all.filter((v) => v.status === 'published').length,
      syncedToRealChannel: all.filter((v) => !!v.externalVideoId).length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, v) => s + (v.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
      totalSnapshots: snapshots.length,
      latestSubscriberCount: latestSnapshot?.subscriberCount ?? null,
      latestTotalViews: latestSnapshot?.totalViews ?? null,
      latestSnapshotDate: latestSnapshot?.snapshotDate.toISOString() ?? null,
    },
    byStatus: all.reduce((acc: Record<string, number>, v) => ({ ...acc, [v.status]: (acc[v.status] ?? 0) + 1 }), {}),
  });
});
