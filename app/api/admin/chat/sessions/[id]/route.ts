import { NextRequest, NextResponse } from 'next/server';
import { getConversation } from '@/lib/db/chat-queries';
import { getEvalsForMessage } from '@/lib/db/chat-eval-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}
