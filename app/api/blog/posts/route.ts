import { NextRequest, NextResponse } from 'next/server';
import { getPublishedPosts, getAllPostsAdmin, createPost } from '@/lib/db/blog-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get('admin') === 'true';
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const categorySlug = searchParams.get('category') || undefined;
    const tagSlug = searchParams.get('tag') || undefined;
    const search = searchParams.get('search') || undefined;
    const status = (searchParams.get('status') || undefined) as 'draft' | 'published' | 'archived' | 'all' | undefined;

    if (admin) {
      const result = await getAllPostsAdmin({ offset, limit, status, search });
      return NextResponse.json(result);
    }

    const result = await getPublishedPosts({ offset, limit, categorySlug, tagSlug, search });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
}
