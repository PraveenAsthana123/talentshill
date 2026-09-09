import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';
import { getEvalStats } from '@/lib/db/chat-eval-queries';

export const GET = withPermission('chat', 'read')(async () => {
  const sessions = db.select().from(schema.chatSessions).all();
  const requests = db.select().from(schema.chatRequests).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'chat')).all();
  const scored = requests.filter((r) => r.responseQualityScore !== null && r.responseQualityScore !== undefined);
  const evalStats = getEvalStats();

  return NextResponse.json({
    kpis: {
      totalSessions: sessions.length,
      activeSessions: sessions.filter((s) => s.status === 'active').length,
      totalRequests: requests.length,
      unscoredRequests: requests.length - scored.length,
      avgResponseQualityScore: scored.length > 0 ? Math.round(scored.reduce((s, r) => s + (r.responseQualityScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    evalStats,
    byRequestStatus: requests.reduce((acc: Record<string, number>, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {}),
  });
});
