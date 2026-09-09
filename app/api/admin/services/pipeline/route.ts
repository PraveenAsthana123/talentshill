import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runServiceContentPipeline } from '@/lib/pipelines/service-content-pipeline';

export const POST = withPermission('services', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { serviceId?: string } | null;
  if (!body?.serviceId) return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runServiceContentPipeline({ serviceId: body.serviceId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.serviceId ? 200 : 404 });
});
