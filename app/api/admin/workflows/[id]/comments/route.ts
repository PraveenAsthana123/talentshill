import { NextRequest, NextResponse } from 'next/server';
import { getComments, addComment } from '@/lib/db/marketing-workflow-queries';
import { WorkflowCommentSchema } from '@/lib/validation/content-schemas';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = getComments(id);
    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = WorkflowCommentSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const commentId = addComment({ workflowId: id, userId: userId ?? undefined, ...parsed.data });
    return NextResponse.json({ id: commentId }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
