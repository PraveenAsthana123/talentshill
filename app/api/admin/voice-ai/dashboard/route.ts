import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('voice_ai', 'read')(async () => {
  const all = db.select().from(schema.voiceAssets).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'voice_ai')).all();
  const scored = all.filter((a) => a.readinessScore !== null && a.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalAssets: all.length,
      approved: all.filter((a) => a.status === 'approved').length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, a) => s + (a.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byType: all.reduce((acc: Record<string, number>, a) => ({ ...acc, [a.type]: (acc[a.type] ?? 0) + 1 }), {}),
  });
});
