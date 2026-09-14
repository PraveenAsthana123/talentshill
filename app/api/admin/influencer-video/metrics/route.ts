import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createInfluencerMetricEntry, getMetricsForCampaign } from '@/lib/db/influencer-campaign-metrics-queries';
import { getInfluencerCampaignById } from '@/lib/db/influencer-campaign-queries';

export const GET = withPermission('influencer_video', 'read')(async (request: NextRequest) => {
  const campaignId = request.nextUrl.searchParams.get('campaignId');
  if (!campaignId) return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  const campaign = getInfluencerCampaignById(campaignId);
  if (!campaign) return NextResponse.json({ error: 'campaign not found' }, { status: 404 });
  const entries = getMetricsForCampaign(campaignId);
  return NextResponse.json({ entries });
});

export const POST = withPermission('influencer_video', 'create')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as {
    campaignId?: string; recordedDate?: string; reach?: number; clicks?: number; sales?: number; revenue?: number;
  } | null;
  if (!body?.campaignId || !body?.recordedDate) {
    return NextResponse.json({ error: 'campaignId and recordedDate are required' }, { status: 400 });
  }
  const campaign = getInfluencerCampaignById(body.campaignId);
  if (!campaign) return NextResponse.json({ error: 'campaign not found' }, { status: 404 });

  const userId = await getSessionUserIdAsync(request);
  const id = createInfluencerMetricEntry({
    campaignId: body.campaignId,
    recordedDate: new Date(body.recordedDate),
    reach: body.reach,
    clicks: body.clicks,
    sales: body.sales,
    revenue: body.revenue,
    enteredBy: userId ?? undefined,
  });
  return NextResponse.json({ id }, { status: 201 });
});
