import { NextRequest, NextResponse } from 'next/server';
import { addNote, getNotes } from '@/lib/db/admin-note-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

export const GET = withPermission('chat', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const notes = getNotes('chat_request', id);
  return NextResponse.json(notes);
});

export const POST = withPermission('chat', 'manage')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  const { id } = await params;
  const { content } = await request.json();
  const userId = await getSessionUserIdAsync(request) ?? undefined;
  const noteId = addNote({ entityType: 'chat_request', entityId: id, content, createdBy: userId });
  return NextResponse.json({ id: noteId }, { status: 201 });
});
