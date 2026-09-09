import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('content', 'read')(async () => {
  const all = db.select().from(schema.marketingContent).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'content')).all();
  const scored = all.filter((c) => c.readinessScore !== null && c.readinessScore !== undefined);
  const unscored = all.filter((c) => c.readinessScore === null || c.readinessScore === undefined);

  return NextResponse.json({
    kpis: {
      totalContent: all.length,
      published: all.filter((c) => c.status === 'published').length,
      draft: all.filter((c) => c.status === 'draft').length,
      unscored: unscored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, c) => s + (c.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byType: all.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.contentType]: (acc[c.contentType] ?? 0) + 1 }), {}),
    byStatus: all.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.status]: (acc[c.status] ?? 0) + 1 }), {}),
  });
});
