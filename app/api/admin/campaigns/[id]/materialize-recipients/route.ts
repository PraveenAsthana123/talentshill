import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runCampaignRecipientMaterializationPipeline } from '@/lib/pipelines/campaign-recipient-materialization-pipeline';

export const POST = withPermission('campaigns', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  const result = await runCampaignRecipientMaterializationPipeline({ campaignId: id, triggeredBy: userId });
  return NextResponse.json(result, { status: result.campaignId ? 200 : 404 });
});
