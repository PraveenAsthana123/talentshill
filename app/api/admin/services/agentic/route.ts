import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runServiceContentAgent } from '@/lib/agents/service-content-agent';

export const POST = withPermission('services', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { serviceId?: string } | null;
  if (!body?.serviceId) return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runServiceContentAgent({ serviceId: body.serviceId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.serviceId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
