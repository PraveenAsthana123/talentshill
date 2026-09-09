import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runMaintenanceEnforcementAgent } from '@/lib/agents/maintenance-enforcement-agent';

export const POST = withPermission('maintenance', 'manage')(async (request: NextRequest, _context: unknown) => {
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runMaintenanceEnforcementAgent({ requestOrigin: request.nextUrl.origin, triggeredBy: userId });
    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
