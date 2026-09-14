import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { getMessagesForRequest } from '@/lib/db/chat-queries';

export const GET = withPermission('chat', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const messages = getMessagesForRequest(id);
  return NextResponse.json({ messages });
});
