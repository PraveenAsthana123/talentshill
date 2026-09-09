import { NextRequest, NextResponse } from 'next/server';
import { getAllOverrides, upsertOverride, deleteOverride, toggleOverride } from '@/lib/db/content-override-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('content_overrides', 'read')(async (
  _request: NextRequest,
  _context: unknown
) => {
  try {
    const overrides = getAllOverrides();
    return NextResponse.json({ overrides });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch overrides' }, { status: 500 });
  }
});

export const PUT = withPermission('content_overrides', 'update')(async (
  request: NextRequest,
  _context: unknown
) => {
  try {
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    const id = upsertOverride({
      pageSlug: body.pageSlug,
      section: body.section,
      key: body.key,
      value: body.value,
      updatedBy: userId ?? undefined,
    });
    logOperationRun({ moduleKey: 'content_overrides', operationName: 'manual_upsert_override', executionMode: 'manual', status: 'completed', inputPayload: { pageSlug: body.pageSlug, section: body.section, key: body.key }, outputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ id });
  } catch {
    return NextResponse.json({ error: 'Failed to upsert override' }, { status: 500 });
  }
});

export const DELETE = withPermission('content_overrides', 'delete')(async (
  request: NextRequest,
  _context: unknown
) => {
  try {
    const { id } = await request.json();
    const userId = await getSessionUserIdAsync(request);
    deleteOverride(id);
    logOperationRun({ moduleKey: 'content_overrides', operationName: 'manual_delete_override', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete override' }, { status: 500 });
  }
});

export const PATCH = withPermission('content_overrides', 'update')(async (
  request: NextRequest,
  _context: unknown
) => {
  try {
    const { id, isActive } = await request.json();
    const userId = await getSessionUserIdAsync(request);
    toggleOverride(id, isActive);
    logOperationRun({ moduleKey: 'content_overrides', operationName: 'manual_toggle_override', executionMode: 'manual', status: 'completed', inputPayload: { id, isActive }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to toggle override' }, { status: 500 });
  }
});
