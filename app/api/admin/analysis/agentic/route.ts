import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runAnalysisPriorityAgent } from '@/lib/agents/analysis-priority-agent';

export const POST = withPermission('analysis', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { assessmentId?: string } | null;
  if (!body?.assessmentId) return NextResponse.json({ error: 'assessmentId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runAnalysisPriorityAgent({ assessmentId: body.assessmentId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.assessmentId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
