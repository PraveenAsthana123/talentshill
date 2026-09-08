import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost } from '@/lib/db/blog-queries';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action || 'publish'; // 'publish' | 'unpublish'

    const existing = await getPostById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const newStatus = action === 'publish' ? 'published' : 'draft';
    const post = updatePost(id, { status: newStatus });

    return NextResponse.json({ post, status: newStatus });
  } catch {
    return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 });
  }
}
