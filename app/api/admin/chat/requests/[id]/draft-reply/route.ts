import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { runChatSalesAssistantAgent } from '@/lib/agents/chat-sales-assistant-agent';

export const POST = withPermission('chat', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const userId = await getSessionUserIdAsync(request);
  try {
    const result = await runChatSalesAssistantAgent({ requestId: id, triggeredBy: userId });
    return NextResponse.json(result, { status: result.qualification.requestId ? 200 : 404 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
});
