import { NextRequest, NextResponse } from 'next/server';
import {
  getFlagById,
  getFlagHistory,
  updateFlag,
  deleteFlag,
  createFlagVersion,
  rollbackToVersion,
} from '@/lib/db/feature-flag-queries';
import { getSessionUserIdAsync } from '@/lib/security/rbac';
import { bustCache } from '@/lib/feature-flags/cache';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const flag = getFlagById(id);
    if (!flag) {
      return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
    }
    const history = getFlagHistory(id);
    return NextResponse.json({ flag, history });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch flag' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'rollback' && body.versionId) {
      const userId = await getSessionUserIdAsync(request);
      const result = rollbackToVersion(id, body.versionId, userId ?? undefined);
      bustCache();
      if (!result) {
        return NextResponse.json({ error: 'Version not found' }, { status: 404 });
      }
      return NextResponse.json({ version: result });
    }

    if (body.action === 'create-version' && body.config) {
      const userId = await getSessionUserIdAsync(request);
      const versionId = createFlagVersion(id, body.config, userId ?? undefined);
      bustCache();
      return NextResponse.json({ versionId });
    }

    // Standard update
    const { label, description, module, sortOrder } = body;
    updateFlag(id, { label, description, module, sortOrder });
    bustCache();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteFlag(id);
    bustCache();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 });
  }
}
