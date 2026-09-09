import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runLeadScoringPipeline } from '@/lib/pipelines/lead-scoring-pipeline';

export const POST = withPermission('leads', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { submissionId?: string } | null;
  if (!body?.submissionId) return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });

  const userId = await getSessionUserIdAsync(request);
  const result = runLeadScoringPipeline({ submissionId: body.submissionId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.submissionId ? 200 : 404 });
});
