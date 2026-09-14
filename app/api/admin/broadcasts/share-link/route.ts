import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createReportShareToken } from '@/lib/report-share/queries';

export const POST = withPermission('broadcasts', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const { token } = createReportShareToken({
    moduleKey: 'broadcasts',
    reportType: 're_engagement_summary',
    createdBy: userId,
    expiresInDays: 30,
  });
  return NextResponse.json({ token, url: `/report/broadcasts/${token}` }, { status: 201 });
});
