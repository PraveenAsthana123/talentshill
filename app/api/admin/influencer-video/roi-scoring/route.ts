import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runInfluencerRoiPipeline } from '@/lib/pipelines/influencer-roi-pipeline';

export const POST = withPermission('influencer_video', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runInfluencerRoiPipeline({ triggeredBy: userId });
  return NextResponse.json(result);
});
