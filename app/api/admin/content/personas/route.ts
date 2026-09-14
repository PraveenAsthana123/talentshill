import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createPersona, getAllPersonas } from '@/lib/db/content-persona-queries';

export const GET = withPermission('content', 'read')(async () => {
  const items = getAllPersonas();
  return NextResponse.json({ items });
});

export const POST = withPermission('content', 'create')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as { name?: string; description?: string; toneNotes?: string } | null;
  if (!body?.name || !body?.description) return NextResponse.json({ error: 'name and description are required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const id = createPersona({ name: body.name, description: body.description, toneNotes: body.toneNotes, createdBy: userId ?? undefined });
  return NextResponse.json({ id }, { status: 201 });
});
