import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('influencer_video', 'read')(async () => {
  const all = db.select().from(schema.influencerCampaigns).orderBy(desc(schema.influencerCampaigns.readinessScore)).all();
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalCampaigns: all.length,
    campaigns: all.map((c) => ({ influencerName: c.influencerName, platform: c.platform, status: c.status, agreedFee: c.agreedFee, readinessScore: c.readinessScore ?? null })),
  });
});
