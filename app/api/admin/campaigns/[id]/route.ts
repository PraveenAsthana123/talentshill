import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById, updateCampaign, deleteCampaign, getCampaignVariants } from '@/lib/db/campaign-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('campaigns', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const campaign = getCampaignById(id);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }
    const variants = getCampaignVariants(id);
    return NextResponse.json({ campaign, variants });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch campaign' }, { status: 500 });
  }
});

export const PATCH = withPermission('campaigns', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();

    const { scheduledAt, startedAt, completedAt, ...rest } = body;
    updateCampaign(id, {
      ...rest,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : undefined,
    });

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'campaigns', operationName: 'update_campaign', executionMode: 'manual', status: 'completed',
      inputPayload: { id, fields: Object.keys(rest) }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }
});

export const DELETE = withPermission('campaigns', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    deleteCampaign(id);

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'campaigns', operationName: 'delete_campaign', executionMode: 'manual', status: 'completed',
      inputPayload: { id }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }
});
