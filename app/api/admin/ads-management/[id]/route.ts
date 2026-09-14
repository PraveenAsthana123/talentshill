import { NextRequest, NextResponse } from 'next/server';
import { getAdCampaignById, updateAdCampaign, deleteAdCampaign } from '@/lib/db/ad-campaign-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('ads_management', 'read')(async (_request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getAdCampaignById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ campaign: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch ad campaign' }, { status: 500 });
  }
});

export const PATCH = withPermission('ads_management', 'update')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    const data: Record<string, unknown> = { ...body };
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);
    updateAdCampaign(id, data);
    logOperationRun({ moduleKey: 'ads_management', operationName: 'manual_update_campaign', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update ad campaign' }, { status: 500 });
  }
});

export const DELETE = withPermission('ads_management', 'delete')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getAdCampaignById(id);
    deleteAdCampaign(id);
    logOperationRun({ moduleKey: 'ads_management', operationName: 'manual_delete_campaign', executionMode: 'manual', status: 'completed', inputPayload: { id, name: item?.name }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete ad campaign' }, { status: 500 });
  }
});
