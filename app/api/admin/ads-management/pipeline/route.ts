import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runAdCampaignReadinessPipeline } from '@/lib/pipelines/ad-campaign-readiness-pipeline';

export const POST = withPermission('ads_management', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { campaignId?: string } | null;
  if (!body?.campaignId) return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runAdCampaignReadinessPipeline({ campaignId: body.campaignId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.campaignId ? 200 : 404 });
});
