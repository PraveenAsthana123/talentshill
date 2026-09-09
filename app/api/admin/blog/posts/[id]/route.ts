import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost, deletePost } from '@/lib/db/blog-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

// SECURITY FIX (2026-09-09): see app/api/admin/blog/posts/route.ts --
// this single-post read (incl. drafts)/update/delete previously lived at
// the unauthenticated /api/blog/posts/[id]. Verified via repo grep that
// the only caller is the admin post editor (features/blog/components/
// BlogPostEditor.tsx); the public single-post page reads directly from
// the DB via lib/blog.ts, never through this route.
export const GET = withPermission('blog', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const post = await getPostById(id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
  }
});

export const PATCH = withPermission('blog', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const post = updatePost(id, body);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'blog', operationName: 'update_post', executionMode: 'manual', status: 'completed',
      inputPayload: { id, fields: Object.keys(body) }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
});

export const DELETE = withPermission('blog', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const deleted = deletePost(id);
    if (!deleted) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'blog', operationName: 'delete_post', executionMode: 'manual', status: 'completed',
      inputPayload: { id }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
});
