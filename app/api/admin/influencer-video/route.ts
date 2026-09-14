import { NextRequest, NextResponse } from 'next/server';
import { getAllInfluencerCampaigns, createInfluencerCampaign } from '@/lib/db/influencer-campaign-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('influencer_video', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllInfluencerCampaigns({ status, platform, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch influencer campaigns' }, { status: 500 });
  }
});

export const POST = withPermission('influencer_video', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { influencerName, platform } = body;
    if (!influencerName || !platform) return NextResponse.json({ error: 'influencerName and platform are required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createInfluencerCampaign({ influencerName, platform, deliverables: body.deliverables, agreedFee: body.agreedFee, contactEmail: body.contactEmail, audienceFitScore: body.audienceFitScore, campaignFeedbackNotes: body.campaignFeedbackNotes, createdBy: userId ?? undefined });
    logOperationRun({ moduleKey: 'influencer_video', operationName: 'manual_create_campaign', executionMode: 'manual', status: 'completed', inputPayload: { id, influencerName, platform }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create influencer campaign' }, { status: 500 });
  }
});
