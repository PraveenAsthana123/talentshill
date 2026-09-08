import { NextRequest, NextResponse } from 'next/server';
import { getListById, updateList, deleteList, getListMembers, addListMembers, removeListMembers } from '@/lib/db/list-queries';
import { withPermission } from '@/lib/security/rbac';

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

    if (body.action === 'add-members' && Array.isArray(body.contactIds)) {
      addListMembers(id, body.contactIds);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'remove-members' && Array.isArray(body.contactIds)) {
      removeListMembers(id, body.contactIds);
      return NextResponse.json({ success: true });
    }

    const { name, description, segmentRules } = body;
    updateList(id, { name, description, segmentRules });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update list' }, { status: 500 });
  }
});

export const DELETE = withPermission('lists', 'delete')(async (
  _request: NextRequest,
  context: unknown
) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    deleteList(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete list' }, { status: 500 });
  }
});
