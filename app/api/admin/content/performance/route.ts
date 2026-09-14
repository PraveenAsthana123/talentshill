import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContentPerformancePipeline } from '@/lib/pipelines/content-performance-pipeline';

export const POST = withPermission('content', 'manage')(async (request: NextRequest) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runContentPerformancePipeline({ triggeredBy: userId });
  return NextResponse.json(result);
});
