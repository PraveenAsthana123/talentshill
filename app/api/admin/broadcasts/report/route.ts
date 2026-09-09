import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('broadcasts', 'read')(async () => {
  const all = db.select().from(schema.broadcasts).orderBy(desc(schema.broadcasts.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalBroadcasts: all.length,
    broadcasts: all.map((b) => ({
      name: b.name, status: b.status, audienceType: b.audienceType, readinessScore: b.readinessScore ?? null,
      totalSent: b.totalSent ?? 0, totalFailed: b.totalFailed ?? 0,
    })),
  });
});
