import { NextRequest, NextResponse } from 'next/server';
import { getAssets, getAssetCount, createAsset } from '@/lib/db/content-asset-queries';
import { CreateAssetSchema } from '@/lib/validation/content-schemas';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const assetType = url.searchParams.get('assetType') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const items = getAssets(offset, limit, { assetType, status });
    const total = getAssetCount({ assetType, status });
    return NextResponse.json({ items, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreateAssetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const userId = await getSessionUserIdAsync(request);
    const id = createAsset({ ...parsed.data, createdBy: userId ?? undefined });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create asset' }, { status: 500 });
  }
}
