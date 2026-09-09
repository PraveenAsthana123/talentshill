import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runSystemHealthPipeline } from '@/lib/pipelines/system-health-pipeline';

export const POST = withPermission('health', 'manage')(async (request: NextRequest, _context: unknown) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runSystemHealthPipeline({ triggeredBy: userId });
  return NextResponse.json(result, { status: 200 });
});
