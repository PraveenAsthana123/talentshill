import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createReportShareToken } from '@/lib/report-share/queries';

export const POST = withPermission('influencer_video', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const { token } = createReportShareToken({
    moduleKey: 'influencer_video',
    reportType: 'roi_summary',
    createdBy: userId,
    expiresInDays: 30,
  });
  return NextResponse.json({ token, url: `/report/influencer-video/${token}` }, { status: 201 });
});
