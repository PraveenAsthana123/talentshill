import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runMaintenanceEnforcementPipeline } from '@/lib/pipelines/maintenance-enforcement-pipeline';

export const POST = withPermission('maintenance', 'manage')(async (request: NextRequest, _context: unknown) => {
  const userId = await getSessionUserIdAsync(request);
  const result = await runMaintenanceEnforcementPipeline({ requestOrigin: request.nextUrl.origin, triggeredBy: userId });
  return NextResponse.json(result, { status: 200 });
});
