import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runFeatureFlagReadinessAgent } from '@/lib/agents/feature-flag-readiness-agent';

export const POST = withPermission('features', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { flagId?: string } | null;
  if (!body?.flagId) return NextResponse.json({ error: 'flagId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runFeatureFlagReadinessAgent({ flagId: body.flagId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.flagId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
