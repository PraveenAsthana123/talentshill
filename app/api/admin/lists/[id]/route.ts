import { NextRequest, NextResponse } from 'next/server';
import { getListById, updateList, deleteList, getListMembers, addListMembers, removeListMembers } from '@/lib/db/list-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('lists', 'read')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const list = getListById(id);
    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const members = getListMembers(id, { limit, offset });

    return NextResponse.json({ list, members });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch list' }, { status: 500 });
  }
});

export const PATCH = withPermission('lists', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);

    if (body.action === 'add-members' && Array.isArray(body.contactIds)) {
      addListMembers(id, body.contactIds);
      logOperationRun({ moduleKey: 'lists', operationName: 'manual_add_members', executionMode: 'manual', status: 'completed', inputPayload: { id, count: body.contactIds.length }, triggeredBy: userId });
      return NextResponse.json({ success: true });
    }

    if (body.action === 'remove-members' && Array.isArray(body.contactIds)) {
      removeListMembers(id, body.contactIds);
      logOperationRun({ moduleKey: 'lists', operationName: 'manual_remove_members', executionMode: 'manual', status: 'completed', inputPayload: { id, count: body.contactIds.length }, triggeredBy: userId });
      return NextResponse.json({ success: true });
    }

    const { name, description, segmentRules } = body;
    updateList(id, { name, description, segmentRules });
    logOperationRun({ moduleKey: 'lists', operationName: 'manual_update_list', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
  }
});

export const DELETE = withPermission('lists', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    deleteList(id);
    logOperationRun({ moduleKey: 'lists', operationName: 'manual_delete_list', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
  }
});
