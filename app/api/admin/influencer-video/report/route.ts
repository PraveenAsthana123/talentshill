import { NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { desc } from 'drizzle-orm';
import { withPermission } from '@/lib/security/rbac';
import { runInfluencerRoiPipeline } from '@/lib/pipelines/influencer-roi-pipeline';

export const GET = withPermission('influencer_video', 'read')(async () => {
  const all = db.select().from(schema.influencerCampaigns).orderBy(desc(schema.influencerCampaigns.readinessScore)).all();
  const roi = await runInfluencerRoiPipeline({ triggeredBy: null });
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    totalCampaigns: all.length,
    campaigns: all.map((c) => ({ influencerName: c.influencerName, platform: c.platform, status: c.status, agreedFee: c.agreedFee, readinessScore: c.readinessScore ?? null })),
    roiScoring: { scoredCreators: roi.scoredCreators, unscoredCreators: roi.unscoredCreators, suggestions: roi.suggestions },
  });
});
