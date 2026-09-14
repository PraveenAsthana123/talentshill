import { NextRequest, NextResponse } from 'next/server';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { createBrandMention, getAllBrandMentions } from '@/lib/db/brand-mention-queries';

export const GET = withPermission('branding', 'read')(async () => {
  const items = getAllBrandMentions();
  return NextResponse.json({ items });
});

export const POST = withPermission('branding', 'create')(async (request: NextRequest) => {
  const body = await request.json().catch(() => null) as {
    source?: string; sourceName?: string; excerpt?: string; url?: string; collectedAt?: string;
  } | null;
  if (!body?.source || !body?.excerpt) return NextResponse.json({ error: 'source and excerpt are required' }, { status: 400 });
  const userId = await getSessionUserIdAsync(request);
  const id = createBrandMention({
    source: body.source as 'social' | 'review' | 'news' | 'survey',
    sourceName: body.sourceName,
    excerpt: body.excerpt,
    url: body.url,
    collectedAt: body.collectedAt ? new Date(body.collectedAt) : new Date(),
    createdBy: userId ?? undefined,
  });
  return NextResponse.json({ id }, { status: 201 });
});
