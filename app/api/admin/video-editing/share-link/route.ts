import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createReportShareToken } from '@/lib/report-share/queries';

export const POST = withPermission('video_editing', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const { token } = createReportShareToken({
    moduleKey: 'video_editing',
    reportType: 'repurposing_summary',
    createdBy: userId,
    expiresInDays: 30,
  });
  return NextResponse.json({ token, url: `/report/video-editing/${token}` }, { status: 201 });
});
