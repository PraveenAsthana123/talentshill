import { NextRequest, NextResponse } from 'next/server';
import { getAllLists, createList } from '@/lib/db/list-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('lists', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const listsList = getAllLists();
    return NextResponse.json({ lists: listsList });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch lists' }, { status: 500 });
  }
});

export const POST = withPermission('lists', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { name, description, type, segmentRules } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const userId = await getSessionUserIdAsync(request);
    const id = createList({
      name,
      description,
      type,
      segmentRules,
      createdBy: userId ?? undefined,
    });
    logOperationRun({ moduleKey: 'lists', operationName: 'manual_create_list', executionMode: 'manual', status: 'completed', inputPayload: { name, type }, outputPayload: { id }, triggeredBy: userId });

    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create list' }, { status: 500 });
  }
});
