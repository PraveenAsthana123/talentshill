import { NextRequest, NextResponse } from 'next/server';
import { getCampaignById, updateCampaign } from '@/lib/db/campaign-queries';
import { createJob } from '@/lib/db/job-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const POST = withPermission('campaigns', 'manage')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const campaign = getCampaignById(id);

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status !== 'draft' && campaign.status !== 'paused') {
      return NextResponse.json({ error: 'Campaign cannot be launched in current status' }, { status: 400 });
    }

    const userId = await getSessionUserIdAsync(request);

    // Update campaign status
    updateCampaign(id, { status: 'scheduled', startedAt: new Date() });

    // Create a job for the campaign sender
    const jobId = createJob({
      type: 'campaign_send',
      payload: { campaignId: id },
      priority: 5,
      createdBy: userId ?? undefined,
    });

    logOperationRun({
      moduleKey: 'campaigns', operationName: 'launch_campaign', executionMode: 'manual', status: 'completed',
      inputPayload: { id }, outputPayload: { id, jobId }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true, message: 'Campaign launched' });
  } catch {
    return NextResponse.json({ error: 'Failed to launch campaign' }, { status: 500 });
  }
});
