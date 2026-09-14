import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('voice_ai', 'read')(async () => {
  const all = db.select().from(schema.voiceAssets).orderBy(desc(schema.voiceAssets.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalAssets: all.length,
    assets: all.map((a) => ({ title: a.title, type: a.type, status: a.status, durationSeconds: a.durationSeconds, readinessScore: a.readinessScore ?? null })),
  });
});
