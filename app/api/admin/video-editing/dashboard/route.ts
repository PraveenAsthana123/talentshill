import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('video_editing', 'read')(async () => {
  const all = db.select().from(schema.videoProjects).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'video_editing')).all();
  const scored = all.filter((p) => p.readinessScore !== null && p.readinessScore !== undefined);
  const clips = db.select().from(schema.videoClipPlans).all();
  const clipsScored = clips.filter((c) => c.readinessScore !== null && c.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalProjects: all.length,
      published: all.filter((p) => p.status === 'published').length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, p) => s + (p.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
      totalClipPlans: clips.length,
      deliveredClips: clips.filter((c) => c.status === 'delivered').length,
      avgClipReadinessScore: clipsScored.length > 0 ? Math.round(clipsScored.reduce((s, c) => s + (c.readinessScore || 0), 0) / clipsScored.length) : 0,
    },
    byTool: all.reduce((acc: Record<string, number>, p) => ({ ...acc, [p.tool]: (acc[p.tool] ?? 0) + 1 }), {}),
    byStatus: all.reduce((acc: Record<string, number>, p) => ({ ...acc, [p.status]: (acc[p.status] ?? 0) + 1 }), {}),
    byClipStatus: clips.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.status]: (acc[c.status] ?? 0) + 1 }), {}),
    byClipPlatform: clips.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.targetPlatform]: (acc[c.targetPlatform] ?? 0) + 1 }), {}),
  });
});
