import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('videos', 'read')(async () => {
  const all = db.select().from(schema.videos).all();
  const runs = db.select().from(schema.operationRun).all().filter((r) => r.moduleKey === 'videos');
  const scored = all.filter((v) => v.contentScore !== null && v.contentScore !== undefined);
  const unscored = all.filter((v) => v.contentScore === null || v.contentScore === undefined);

  return NextResponse.json({
    kpis: {
      totalVideos: all.length,
      active: all.filter((v) => v.isActive).length,
      inactive: all.filter((v) => !v.isActive).length,
      unscored: unscored.length,
      avgContentScore: scored.length > 0 ? Math.round(scored.reduce((s, v) => s + (v.contentScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byProvider: all.reduce((acc: Record<string, number>, v) => ({ ...acc, [v.provider || 'unknown']: (acc[v.provider || 'unknown'] ?? 0) + 1 }), {}),
  });
});
