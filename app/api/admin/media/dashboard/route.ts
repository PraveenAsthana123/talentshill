import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('media', 'read')(async () => {
  const all = db.select().from(schema.media).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'media')).all();
  const scored = all.filter((m) => m.readinessScore !== null && m.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalMedia: all.length,
      active: all.filter((m) => m.isActive).length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, m) => s + (m.readinessScore || 0), 0) / scored.length) : 0,
      totalSizeBytes: all.reduce((s, m) => s + (m.size || 0), 0),
      totalRuns: runs.length,
    },
    byMimeType: all.reduce((acc: Record<string, number>, m) => ({ ...acc, [m.mimeType]: (acc[m.mimeType] ?? 0) + 1 }), {}),
  });
});
