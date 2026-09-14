import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createAdCampaignMetricEntry, getMetricsForCampaign } from '@/lib/db/ad-campaign-metrics-queries';
import { getAdCampaignById } from '@/lib/db/ad-campaign-queries';

export const GET = withPermission('ads_management', 'read')(async (request: NextRequest) => {
  const campaignId = request.nextUrl.searchParams.get('campaignId');
  if (!campaignId) return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  const campaign = getAdCampaignById(campaignId);
  if (!campaign) return NextResponse.json({ error: 'campaign not found' }, { status: 404 });
  const entries = getMetricsForCampaign(campaignId);
  return NextResponse.json({ entries });
});

export const POST = withPermission('ads_management', 'create')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as {
    campaignId?: string; recordedDate?: string; impressions?: number; clicks?: number;
    conversions?: number; revenue?: number; spendForPeriod?: number;
  } | null;
  if (!body?.campaignId || !body?.recordedDate) {
    return NextResponse.json({ error: 'campaignId and recordedDate are required' }, { status: 400 });
  }
  const campaign = getAdCampaignById(body.campaignId);
  if (!campaign) return NextResponse.json({ error: 'campaign not found' }, { status: 404 });

  const userId = await getSessionUserIdAsync(request);
  const id = createAdCampaignMetricEntry({
    campaignId: body.campaignId,
    recordedDate: new Date(body.recordedDate),
    impressions: body.impressions,
    clicks: body.clicks,
    conversions: body.conversions,
    revenue: body.revenue,
    spendForPeriod: body.spendForPeriod,
    enteredBy: userId ?? undefined,
  });
  return NextResponse.json({ id }, { status: 201 });
});
