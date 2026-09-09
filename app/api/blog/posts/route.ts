import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts } from '@/lib/db/blog-queries';

// SECURITY FIX (2026-09-09): the admin branch (?admin=true, returning
// draft/archived posts) and POST (create) were removed from this public
// route -- they previously required zero auth, letting anyone read every
// unpublished draft or create a post on the public site. The admin-gated
// equivalents now live at /api/admin/blog/posts. This route stays public
// by design (the real public blog listing page) and can now only ever
// return published posts, not merely "by default".
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const categorySlug = searchParams.get('category') || undefined;
    const tagSlug = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await getPublishedPosts({ offset, limit, categorySlug, tagSlug, search });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
