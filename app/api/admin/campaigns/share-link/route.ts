import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createReportShareToken } from '@/lib/report-share/queries';

export const POST = withPermission('campaigns', 'manage')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as { campaignId?: string } | null;
  if (!body?.campaignId) return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const { token } = createReportShareToken({
    moduleKey: 'campaigns',
    reportType: 'campaign_summary',
    entityId: body.campaignId,
    createdBy: userId,
    expiresInDays: 30,
  });
  return NextResponse.json({ token, url: `/report/campaigns/${token}` }, { status: 201 });
});
