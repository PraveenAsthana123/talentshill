import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createEngagementEntry, getEngagementForContent } from '@/lib/db/content-engagement-queries';
import { getContentById } from '@/lib/db/marketing-content-queries';

export const GET = withPermission('content', 'read')(async (request: NextRequest) => {
  const contentId = request.nextUrl.searchParams.get('contentId');
  if (!contentId) return NextResponse.json({ error: 'contentId is required' }, { status: 400 });
  const content = getContentById(contentId);
  if (!content) return NextResponse.json({ error: 'content not found' }, { status: 404 });
  const entries = getEngagementForContent(contentId);
  return NextResponse.json({ entries });
});

export const POST = withPermission('content', 'create')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as {
    contentId?: string; recordedDate?: string; views?: number; leadsGenerated?: number;
  } | null;
  if (!body?.contentId || !body?.recordedDate) return NextResponse.json({ error: 'contentId and recordedDate are required' }, { status: 400 });
  const content = getContentById(body.contentId);
  if (!content) return NextResponse.json({ error: 'content not found' }, { status: 404 });

  const userId = await getSessionUserIdAsync(request);
  const id = createEngagementEntry({
    contentId: body.contentId, recordedDate: new Date(body.recordedDate),
    views: body.views, leadsGenerated: body.leadsGenerated, enteredBy: userId ?? undefined,
  });
  return NextResponse.json({ id }, { status: 201 });
});
