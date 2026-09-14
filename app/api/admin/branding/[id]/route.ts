import { NextRequest, NextResponse } from 'next/server';
import { getBrandAssetById, updateBrandAsset, deleteBrandAsset } from '@/lib/db/brand-asset-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('branding', 'read')(async (_request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getBrandAssetById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ asset: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch brand asset' }, { status: 500 });
  }
});

export const PATCH = withPermission('branding', 'update')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    updateBrandAsset(id, body);
    logOperationRun({ moduleKey: 'branding', operationName: 'manual_update_asset', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update brand asset' }, { status: 500 });
  }
});

export const DELETE = withPermission('branding', 'delete')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getBrandAssetById(id);
    deleteBrandAsset(id);
    logOperationRun({ moduleKey: 'branding', operationName: 'manual_delete_asset', executionMode: 'manual', status: 'completed', inputPayload: { id, name: item?.name }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete brand asset' }, { status: 500 });
  }
});
