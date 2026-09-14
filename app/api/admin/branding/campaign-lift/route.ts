import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { computeCampaignLift } from '@/lib/pipelines/brand-health-pipeline';

export const GET = withPermission('branding', 'read')(async (request: NextRequest) => {
  const campaignId = request.nextUrl.searchParams.get('campaignId');
  if (!campaignId) return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  const result = computeCampaignLift(campaignId);
  return NextResponse.json(result);
});
