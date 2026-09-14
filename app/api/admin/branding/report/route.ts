import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('branding', 'read')(async () => {
  const all = db.select().from(schema.brandAssets).orderBy(desc(schema.brandAssets.readinessScore)).all();
  const snapshots = db.select().from(schema.brandHealthSnapshots).orderBy(desc(schema.brandHealthSnapshots.snapshotDate)).limit(10).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalAssets: all.length,
    assets: all.map((a) => ({ name: a.name, category: a.category, status: a.status, version: a.version, readinessScore: a.readinessScore ?? null })),
    healthSnapshots: snapshots.map((s) => ({
      snapshotDate: s.snapshotDate.toISOString(), healthScore: s.healthScore, label: s.label,
      positiveMentions: s.positiveMentions, neutralMentions: s.neutralMentions, negativeMentions: s.negativeMentions, competitorsTracked: s.competitorsTracked,
    })),
  });
});
