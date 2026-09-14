import { NextRequest, NextResponse } from 'next/server';
import { getInfluencerCampaignById, updateInfluencerCampaign, deleteInfluencerCampaign } from '@/lib/db/influencer-campaign-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('influencer_video', 'read')(async (_request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getInfluencerCampaignById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ campaign: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch influencer campaign' }, { status: 500 });
  }
});

export const PATCH = withPermission('influencer_video', 'update')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    updateInfluencerCampaign(id, body);
    logOperationRun({ moduleKey: 'influencer_video', operationName: 'manual_update_campaign', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update influencer campaign' }, { status: 500 });
  }
});

export const DELETE = withPermission('influencer_video', 'delete')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getInfluencerCampaignById(id);
    deleteInfluencerCampaign(id);
    logOperationRun({ moduleKey: 'influencer_video', operationName: 'manual_delete_campaign', executionMode: 'manual', status: 'completed', inputPayload: { id, influencerName: item?.influencerName }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete influencer campaign' }, { status: 500 });
  }
});
