import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runAnalysisHealthPipeline } from '@/lib/pipelines/analysis-health-pipeline';

export const POST = withPermission('analysis', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { assessmentId?: string } | null;
  if (!body?.assessmentId) return NextResponse.json({ error: 'assessmentId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runAnalysisHealthPipeline({ assessmentId: body.assessmentId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.assessmentId ? 200 : 404 });
});
