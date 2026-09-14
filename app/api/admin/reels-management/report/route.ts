import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('reels_management', 'read')(async () => {
  const all = db.select().from(schema.reels).orderBy(desc(schema.reels.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalReels: all.length,
    reels: all.map((r) => ({ title: r.title, platform: r.platform, status: r.status, scheduledAt: r.scheduledAt, readinessScore: r.readinessScore ?? null })),
  });
});
