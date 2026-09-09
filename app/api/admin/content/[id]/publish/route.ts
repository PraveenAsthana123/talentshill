import { NextRequest, NextResponse } from 'next/server';
import { getContentById, publishContent, updateContent } from '@/lib/db/marketing-content-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

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
    const userId = await getSessionUserIdAsync(request);
    if (body.action === 'unpublish') {
      updateContent(id, { status: 'draft' });
      logOperationRun({ moduleKey: 'content', operationName: 'manual_unpublish_content', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    } else {
      publishContent(id);
      logOperationRun({ moduleKey: 'content', operationName: 'manual_publish_content', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update publish status' }, { status: 500 });
  }
});
