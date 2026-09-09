import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runRagQaAgent } from '@/lib/agents/rag-qa-agent';

export const POST = withPermission('rag', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { question?: string } | null;
  if (!body?.question || typeof body.question !== 'string' || body.question.trim().length === 0) {
    return NextResponse.json({ error: 'question is required and must be a non-empty string' }, { status: 400 });
  }
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runRagQaAgent({ question: body.question.trim(), triggeredBy: userId });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
