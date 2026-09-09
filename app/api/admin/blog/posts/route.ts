import { NextRequest, NextResponse } from 'next/server';
import { getAllPostsAdmin, createPost } from '@/lib/db/blog-queries';
import { withPermission } from '@/lib/security/rbac';

// SECURITY FIX (2026-09-09): this admin post list (all statuses incl.
// unpublished drafts) and post-creation endpoint previously lived at the
// unauthenticated /api/blog/posts (reachable with ?admin=true, and POST
// required no auth at all -- anyone could read every draft or create a
// post on the public site). Moved here under RBAC. The genuinely public
// path (published-only listing) stays at /api/blog/posts with the admin
// branch removed entirely, not just gated behind a spoofable query param.
export const GET = withPermission('blog', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') || undefined) as 'draft' | 'published' | 'archived' | 'all' | undefined;
    const result = await getAllPostsAdmin({ offset, limit, status, search });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
});

export const POST = withPermission('blog', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { title, content, summary } = body;
    if (!title || !content || !summary) {
      return NextResponse.json({ error: 'Title, content, and summary are required' }, { status: 400 });
    }
    const post = createPost(body);
    return NextResponse.json({ post }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
});
