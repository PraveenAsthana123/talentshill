import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runFeatureFlagReadinessPipeline } from '@/lib/pipelines/feature-flag-readiness-pipeline';

export const POST = withPermission('features', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { flagId?: string } | null;
  if (!body?.flagId) return NextResponse.json({ error: 'flagId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runFeatureFlagReadinessPipeline({ flagId: body.flagId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.flagId ? 200 : 404 });
});
