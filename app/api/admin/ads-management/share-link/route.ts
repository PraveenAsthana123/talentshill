import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createReportShareToken } from '@/lib/report-share/queries';

export const POST = withPermission('ads_management', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const { token } = createReportShareToken({
    moduleKey: 'ads_management',
    reportType: 'budget_optimization',
    createdBy: userId,
    expiresInDays: 30,
  });
  return NextResponse.json({ token, url: `/report/${token}` }, { status: 201 });
});
