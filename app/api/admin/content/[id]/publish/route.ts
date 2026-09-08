import { NextRequest, NextResponse } from 'next/server';
import { getContentById, publishContent, updateContent } from '@/lib/db/marketing-content-queries';
import { withPermission } from '@/lib/security/rbac';

export const POST = withPermission('content', 'manage')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const content = getContentById(id);
    if (!content) return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    const body = await request.json().catch(() => ({}));
    if (body.action === 'unpublish') {
      updateContent(id, { status: 'draft' });
    } else {
      publishContent(id);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update publish status' }, { status: 500 });
  }
});
