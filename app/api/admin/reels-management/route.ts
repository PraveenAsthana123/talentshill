import { NextRequest, NextResponse } from 'next/server';
import { getAllReels, createReel } from '@/lib/db/reel-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('reels_management', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const platform = searchParams.get('platform') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllReels({ status, platform, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reels' }, { status: 500 });
  }
});

export const POST = withPermission('reels_management', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { title, platform } = body;
    if (!title || !platform) return NextResponse.json({ error: 'title and platform are required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createReel({ title, platform, caption: body.caption, assetUrl: body.assetUrl, scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined, createdBy: userId ?? undefined });
    logOperationRun({ moduleKey: 'reels_management', operationName: 'manual_create_reel', executionMode: 'manual', status: 'completed', inputPayload: { id, title, platform }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create reel' }, { status: 500 });
  }
});
