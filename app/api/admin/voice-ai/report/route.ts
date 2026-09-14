import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('voice_ai', 'read')(async () => {
  const all = db.select().from(schema.voiceAssets).orderBy(desc(schema.voiceAssets.readinessScore)).all();
  const calls = db.select().from(schema.voiceCallLogs).orderBy(desc(schema.voiceCallLogs.qualificationScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalAssets: all.length,
    assets: all.map((a) => ({ title: a.title, type: a.type, status: a.status, durationSeconds: a.durationSeconds, readinessScore: a.readinessScore ?? null })),
    calls: calls.map((c) => ({
      direction: c.direction, callDate: c.callDate.toISOString(), durationSeconds: c.durationSeconds,
      qualificationScore: c.qualificationScore ?? null, qualificationTier: c.qualificationTier ?? null, contactLinked: !!c.contactId,
    })),
  });
});
