import { NextRequest, NextResponse } from 'next/server';
import { getAssetById, updateAsset, updateAssetSlides, updateAssetStatus, deleteAsset } from '@/lib/db/content-asset-queries';
import { UpdateAssetSchema, UpdateAssetSlidesSchema, UpdateAssetStatusSchema } from '@/lib/validation/content-schemas';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('assets', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const asset = getAssetById(id);
    if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    return NextResponse.json({ asset: { ...asset, slides: asset.slides ? JSON.parse(asset.slides as string) : [] } });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch asset' }, { status: 500 });
  }
});

export const PATCH = withPermission('assets', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'update-slides') {
      const parsed = UpdateAssetSlidesSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
      updateAssetSlides(id, parsed.data.slides);
      return NextResponse.json({ success: true });
    }

    if (body.action === 'update-status') {
      const parsed = UpdateAssetStatusSchema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
      updateAssetStatus(id, parsed.data.status);
      return NextResponse.json({ success: true });
    }

    const parsed = UpdateAssetSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    updateAsset(id, parsed.data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 });
  }
});

export const DELETE = withPermission('assets', 'delete')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    deleteAsset(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
});
