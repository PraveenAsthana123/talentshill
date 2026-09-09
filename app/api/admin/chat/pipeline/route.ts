import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runChatResponseSafetyPipeline } from '@/lib/pipelines/chat-response-safety-pipeline';

export const POST = withPermission('chat', 'manage')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { requestId?: string } | null;
  if (!body?.requestId) return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const result = await runChatResponseSafetyPipeline({ requestId: body.requestId, triggeredBy: userId });
  return NextResponse.json(result, { status: result.requestId ? 200 : 404 });
});
