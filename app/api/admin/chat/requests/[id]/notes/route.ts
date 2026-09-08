import { NextRequest, NextResponse } from 'next/server';
import { addNote, getNotes } from '@/lib/db/admin-note-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const notes = getNotes('chat_request', id);
  return NextResponse.json(notes);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { content } = await request.json();
  const userId = await getSessionUserIdAsync(request) ?? undefined;
  const noteId = addNote({ entityType: 'chat_request', entityId: id, content, createdBy: userId });
  return NextResponse.json({ id: noteId }, { status: 201 });
}
