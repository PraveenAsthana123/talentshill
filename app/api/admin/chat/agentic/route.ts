import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runChatResponseSafetyAgent } from '@/lib/agents/chat-response-safety-agent';

export const POST = withPermission('chat', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { requestId?: string } | null;
  if (!body?.requestId) return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runChatResponseSafetyAgent({ requestId: body.requestId, triggeredBy: userId });
    return NextResponse.json(result, { status: result.requestId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
