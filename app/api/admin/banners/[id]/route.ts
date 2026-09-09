import { NextRequest, NextResponse } from 'next/server';
import { getBannerById, updateBanner, deleteBanner } from '@/lib/db/banner-queries';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('banners', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const banner = getBannerById(id);
    if (!banner) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ banner });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch banner' }, { status: 500 });
  }
});

export const PATCH = withPermission('banners', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const { startDate, endDate, ...rest } = body;
    updateBanner(id, {
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'banners', operationName: 'update_banner', executionMode: 'manual', status: 'completed',
      inputPayload: { id, fields: Object.keys(body) }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
});

export const DELETE = withPermission('banners', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    deleteBanner(id);

    const userId = await getSessionUserIdAsync(request);
    logOperationRun({
      moduleKey: 'banners', operationName: 'delete_banner', executionMode: 'manual', status: 'completed',
      inputPayload: { id }, outputPayload: { id }, triggeredBy: userId,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
});
