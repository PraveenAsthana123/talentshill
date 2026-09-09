import { NextResponse } from 'next/server';
import { getAllCategories } from '@/lib/db/blog-queries';

// SECURITY FIX (2026-09-09): POST (category creation) removed -- it
// previously required zero auth. Verified via repo grep that this GET is
// only called by the admin post editor (the public blog page sources
// categories server-side via lib/blog.ts) but kept public here since it
// is read-only, non-sensitive (category names only), and harmless to
// leave reachable; the admin-gated equivalent (GET+POST) now lives at
// /api/admin/blog/categories for the editor's use.
export async function GET() {
  try {
    const categories = getAllCategories();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
