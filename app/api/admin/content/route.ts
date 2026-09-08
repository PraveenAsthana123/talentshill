import { NextRequest, NextResponse } from 'next/server';
import { getContentList, getContentCount, createContent } from '@/lib/db/marketing-content-queries';
import { CreateContentSchema } from '@/lib/validation/content-schemas';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';

export const GET = withPermission('content', 'read')(async (
  request: NextRequest,
  _context: unknown
) => {
  try {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const contentType = url.searchParams.get('contentType') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const items = getContentList(offset, limit, { contentType, status, search });
    const total = getContentCount({ contentType, status });
    return NextResponse.json({ items, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
});

export const POST = withPermission('content', 'create')(async (
  request: NextRequest,
  _context: unknown
) => {
  try {
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const parsed = CreateContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const userId = await getSessionUserIdAsync(request);
    const id = createContent({ ...parsed.data, authorId: userId ?? undefined });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
});
