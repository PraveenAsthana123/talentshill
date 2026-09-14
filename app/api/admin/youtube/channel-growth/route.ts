import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runChannelGrowthPipeline } from '@/lib/pipelines/youtube-channel-growth-pipeline';

export const POST = withPermission('youtube', 'manage')(async (request: NextRequest, _context: unknown) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runChannelGrowthPipeline({ triggeredBy: userId });
  return NextResponse.json(result);
});
