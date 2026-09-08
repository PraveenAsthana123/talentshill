import { NextRequest, NextResponse } from 'next/server';
import { getRequest, updateRequestStatus, assignRequest } from '@/lib/db/chat-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const req = getRequest(id);
  if (!req) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  return NextResponse.json(req);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.status) updateRequestStatus(id, body.status);
  if (body.assignedTo) assignRequest(id, body.assignedTo);

  const updated = getRequest(id);
  return NextResponse.json(updated);
}
