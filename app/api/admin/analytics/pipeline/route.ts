import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runAnalyticsHealthPipeline } from '@/lib/pipelines/analytics-health-pipeline';

export const POST = withPermission('analytics', 'manage')(async (request: NextRequest, _context: unknown) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runAnalyticsHealthPipeline({ triggeredBy: userId });
  return NextResponse.json(result, { status: 200 });
});
