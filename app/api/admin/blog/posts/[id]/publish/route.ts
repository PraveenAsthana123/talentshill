import { NextRequest, NextResponse } from 'next/server';
import { getPostById, updatePost } from '@/lib/db/blog-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

// SECURITY FIX (2026-09-09): see app/api/admin/blog/posts/route.ts --
// this publish/unpublish toggle previously lived at the unauthenticated
// /api/blog/posts/[id]/publish, meaning anyone could publish a draft or
// unpublish a live post with zero auth.
export const POST = withPermission('blog', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action || 'publish';

    const existing = await getPostById(id);
    if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const newStatus = action === 'publish' ? 'published' : 'draft';
    const post = updatePost(id, { status: newStatus });

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'blog', operationName: `${action}_post`, executionMode: 'manual', status: 'completed',
      inputPayload: { id, action }, outputPayload: { id, status: newStatus }, triggeredBy: userId,
    });

    return NextResponse.json({ post, status: newStatus });
  } catch {
    return NextResponse.json({ error: 'Failed to update post status' }, { status: 500 });
  }
});
