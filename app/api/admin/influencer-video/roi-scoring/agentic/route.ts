import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runInfluencerRoiAgent } from '@/lib/agents/influencer-roi-agent';

export const POST = withPermission('influencer_video', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runInfluencerRoiAgent({ triggeredBy: userId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
