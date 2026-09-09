import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('analytics', 'read')(async () => {
  const history = db.select().from(schema.analyticsSnapshots).orderBy(desc(schema.analyticsSnapshots.createdAt)).limit(50).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalSnapshots: history.length,
    snapshots: history.map((h) => ({
      healthScore: h.healthScore, openRateScore: h.openRateScore, clickRateScore: h.clickRateScore,
      bounceRateScore: h.bounceRateScore, contactHealthScore: h.contactHealthScore, createdAt: h.createdAt,
    })),
  });
});
