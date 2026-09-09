import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runSurveyOutreachPipeline } from '@/lib/pipelines/survey-outreach-pipeline';

export const POST = withPermission('survey', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { responseId?: string } | null;
  if (!body?.responseId) return NextResponse.json({ error: 'responseId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runSurveyOutreachPipeline({ responseId: body.responseId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.responseId ? 200 : 404 });
});
