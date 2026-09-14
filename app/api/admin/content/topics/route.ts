import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createTopic, getAllTopics } from '@/lib/db/content-topic-queries';

export const GET = withPermission('content', 'read')(async (request: NextRequest) => {
  const status = request.nextUrl.searchParams.get('status') || undefined;
  const items = getAllTopics({ status: status as 'proposed' | 'scheduled' | 'generated' | 'published' | undefined });
  return NextResponse.json({ items });
});

export const POST = withPermission('content', 'create')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as {
    title?: string; targetContentType?: string; personaId?: string; scheduledDate?: string;
  } | null;
  if (!body?.title || !body?.targetContentType) return NextResponse.json({ error: 'title and targetContentType are required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const id = createTopic({
    title: body.title, targetContentType: body.targetContentType, personaId: body.personaId,
    scheduledDate: body.scheduledDate ? new Date(body.scheduledDate) : undefined,
    createdBy: userId ?? undefined,
  });
  return NextResponse.json({ id }, { status: 201 });
});
