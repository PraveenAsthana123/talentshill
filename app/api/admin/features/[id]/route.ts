import { NextRequest, NextResponse } from 'next/server';
import {
  getFlagById,
  getFlagHistory,
  updateFlag,
  deleteFlag,
  createFlagVersion,
  rollbackToVersion,
} from '@/lib/db/feature-flag-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { bustCache } from '@/lib/feature-flags/cache';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('features', 'read')(async (_request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
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
});

export const PATCH = withPermission('features', 'update')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
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
      logOperationRun({ moduleKey: 'features', operationName: 'manual_rollback_flag', executionMode: 'manual', status: 'completed', inputPayload: { id, versionId: body.versionId }, triggeredBy: userId });
      return NextResponse.json({ version: result });
    }

    if (body.action === 'create-version' && body.config) {
      const userId = await getSessionUserIdAsync(request);
      const versionId = createFlagVersion(id, body.config, userId ?? undefined);
      bustCache();
      logOperationRun({ moduleKey: 'features', operationName: 'manual_create_version', executionMode: 'manual', status: 'completed', inputPayload: { id }, outputPayload: { versionId }, triggeredBy: userId });
      return NextResponse.json({ versionId });
    }

    // Standard update
    const { label, description, module, sortOrder } = body;
    updateFlag(id, { label, description, module, sortOrder });
    bustCache();
    const userId = await getSessionUserIdAsync(request);
    logOperationRun({ moduleKey: 'features', operationName: 'manual_update_flag', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update flag' }, { status: 500 });
  }
});

export const DELETE = withPermission('features', 'delete')(async (request: NextRequest, context: unknown) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    deleteFlag(id);
    bustCache();
    logOperationRun({ moduleKey: 'features', operationName: 'manual_delete_flag', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete flag' }, { status: 500 });
  }
});
