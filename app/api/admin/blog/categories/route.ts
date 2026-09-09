import { NextRequest, NextResponse } from 'next/server';
import { getAllCategories, createCategory } from '@/lib/db/blog-queries';
import { withPermission } from '@/lib/security/rbac';

// SECURITY FIX (2026-09-09): category creation previously lived at the
// unauthenticated /api/blog/categories (anyone could create categories on
// the public site). Verified via repo grep that GET here is only called
// by the admin post editor -- the public blog page sources categories
// server-side via lib/blog.ts, never through this route -- so GET moved
// here too rather than staying split across two paths.
export const GET = withPermission('blog', 'read')(async () => {
  try {
    const categories = getAllCategories();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
});

export const POST = withPermission('blog', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { name } = body;
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const category = createCategory(body);
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
});
