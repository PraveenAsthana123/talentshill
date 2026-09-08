import { NextRequest, NextResponse } from 'next/server';
import { getConversation } from '@/lib/db/chat-queries';
import { getEvalsForMessage } from '@/lib/db/chat-eval-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('chat', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const conversation = getConversation(id);
  if (!conversation.session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  // Attach evals to each message
  const messagesWithEvals = conversation.messages.map(msg => ({
    ...msg,
    evals: getEvalsForMessage(msg.id),
  }));

  return NextResponse.json({
    ...conversation,
    messages: messagesWithEvals,
  });
});
