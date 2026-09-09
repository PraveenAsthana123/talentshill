import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runContentOverrideSafetyPipeline } from '@/lib/pipelines/content-override-safety-pipeline';

export const POST = withPermission('content_overrides', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { overrideId?: string } | null;
  if (!body?.overrideId) return NextResponse.json({ error: 'overrideId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runContentOverrideSafetyPipeline({ overrideId: body.overrideId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.overrideId ? 200 : 404 });
});
