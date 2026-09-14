import { NextRequest, NextResponse } from 'next/server';
import { getVoiceAssetById, updateVoiceAsset, deleteVoiceAsset } from '@/lib/db/voice-asset-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('voice_ai', 'read')(async (_request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getVoiceAssetById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ asset: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch voice asset' }, { status: 500 });
  }
});

export const PATCH = withPermission('voice_ai', 'update')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    updateVoiceAsset(id, body);
    logOperationRun({ moduleKey: 'voice_ai', operationName: 'manual_update_asset', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update voice asset' }, { status: 500 });
  }
});

export const DELETE = withPermission('voice_ai', 'delete')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getVoiceAssetById(id);
    deleteVoiceAsset(id);
    logOperationRun({ moduleKey: 'voice_ai', operationName: 'manual_delete_asset', executionMode: 'manual', status: 'completed', inputPayload: { id, title: item?.title }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete voice asset' }, { status: 500 });
  }
});
