import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('voice_ai', 'read')(async () => {
  const all = db.select().from(schema.voiceAssets).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'voice_ai')).all();
  const scored = all.filter((a) => a.readinessScore !== null && a.readinessScore !== undefined);
  const calls = db.select().from(schema.voiceCallLogs).all();
  const qualifiedCalls = calls.filter((c) => c.qualificationTier !== null && c.qualificationTier !== undefined);
  const hotCalls = qualifiedCalls.filter((c) => c.qualificationTier === 'hot').length;
  const contactsLinkedFromCalls = calls.filter((c) => c.contactId !== null && c.contactId !== undefined).length;

  return NextResponse.json({
    kpis: {
      totalAssets: all.length,
      approved: all.filter((a) => a.status === 'approved').length,
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, a) => s + (a.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
      totalCalls: calls.length,
      qualifiedCalls: qualifiedCalls.length,
      hotCalls,
      contactsLinkedFromCalls,
    },
    byType: all.reduce((acc: Record<string, number>, a) => ({ ...acc, [a.type]: (acc[a.type] ?? 0) + 1 }), {}),
    byCallTier: qualifiedCalls.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.qualificationTier!]: (acc[c.qualificationTier!] ?? 0) + 1 }), {}),
  });
});
