import { NextRequest, NextResponse } from 'next/server';
import { getAllBrandAssets, createBrandAsset } from '@/lib/db/brand-asset-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('branding', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllBrandAssets({ category, status, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch brand assets' }, { status: 500 });
  }
});

export const POST = withPermission('branding', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { name, category } = body;
    if (!name || !category) return NextResponse.json({ error: 'name and category are required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createBrandAsset({ name, category, filePath: body.filePath, description: body.description, createdBy: userId ?? undefined });
    logOperationRun({ moduleKey: 'branding', operationName: 'manual_create_asset', executionMode: 'manual', status: 'completed', inputPayload: { id, name, category }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create brand asset' }, { status: 500 });
  }
});
