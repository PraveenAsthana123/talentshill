import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runRunHealthPipeline } from '@/lib/pipelines/run-health-pipeline';

export const POST = withPermission('runs', 'update')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { targetRunId?: string } | null;
  if (!body?.targetRunId) return NextResponse.json({ error: 'targetRunId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runRunHealthPipeline({ targetRunId: body.targetRunId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.targetRunId ? 200 : 404 });
});
