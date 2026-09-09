import { NextRequest, NextResponse } from 'next/server';
import { getContentById, updateContent, deleteContent } from '@/lib/db/marketing-content-queries';
import { getVersions } from '@/lib/db/content-version-queries';
import { UpdateContentSchema } from '@/lib/validation/content-schemas';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('content', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const content = getContentById(id);
    if (!content) return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    const versions = getVersions(id);
    return NextResponse.json({ content, versions });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
  }
});

export const PATCH = withPermission('content', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateContentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    updateContent(id, parsed.data);
    const userId = await getSessionUserIdAsync(request);
    logOperationRun({ moduleKey: 'content', operationName: 'manual_update_content', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(parsed.data) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
});

export const DELETE = withPermission('content', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    deleteContent(id);
    logOperationRun({ moduleKey: 'content', operationName: 'manual_delete_content', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete content' }, { status: 500 });
  }
});
