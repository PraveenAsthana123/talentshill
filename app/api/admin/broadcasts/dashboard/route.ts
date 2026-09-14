import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('broadcasts', 'read')(async () => {
  const all = db.select().from(schema.broadcasts).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'broadcasts')).all();
  const scored = all.filter((b) => b.readinessScore !== null && b.readinessScore !== undefined);
  const unscored = all.filter((b) => b.readinessScore === null || b.readinessScore === undefined);
  const reEngagement = db.select().from(schema.reEngagementMessages).all();
  const atRiskCount = db.select().from(schema.contacts).where(eq(schema.contacts.lifecycleStage, 'at_risk')).all().length;

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
      atRiskCount,
      reEngagementTotal: reEngagement.length,
      reEngagementLogged: reEngagement.filter((m) => m.status === 'logged').length,
      reEngagementFailed: reEngagement.filter((m) => m.status === 'failed').length,
    },
    byStatus: all.reduce((acc: Record<string, number>, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }), {}),
    byReEngagementChannel: reEngagement.reduce((acc: Record<string, number>, m) => ({ ...acc, [m.channel]: (acc[m.channel] ?? 0) + 1 }), {}),
  });
});
