import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('influencer_video', 'read')(async () => {
  const all = db.select().from(schema.influencerCampaigns).all();
  const runs = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'influencer_video')).all();
  const scored = all.filter((c) => c.readinessScore !== null && c.readinessScore !== undefined);

  return NextResponse.json({
    kpis: {
      totalCampaigns: all.length,
      active: all.filter((c) => c.status === 'active').length,
      totalAgreedFees: all.reduce((s, c) => s + (c.agreedFee || 0), 0),
      unscored: all.length - scored.length,
      avgReadinessScore: scored.length > 0 ? Math.round(scored.reduce((s, c) => s + (c.readinessScore || 0), 0) / scored.length) : 0,
      totalRuns: runs.length,
    },
    byPlatform: all.reduce((acc: Record<string, number>, c) => ({ ...acc, [c.platform]: (acc[c.platform] ?? 0) + 1 }), {}),
  });
});
