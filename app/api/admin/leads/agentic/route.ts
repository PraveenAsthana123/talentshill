import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runLeadQualificationAgent } from '@/lib/agents/lead-qualification-agent';

export const POST = withPermission('leads', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { submissionId?: string } | null;
  if (!body?.submissionId) return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });

  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runLeadQualificationAgent({ submissionId: body.submissionId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.submissionId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
