import { NextRequest, NextResponse } from 'next/server';
import { getAllAdCampaigns, createAdCampaign } from '@/lib/db/ad-campaign-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('ads_management', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllAdCampaigns({ platform, status, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch ad campaigns' }, { status: 500 });
  }
});

export const POST = withPermission('ads_management', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { name, platform } = body;
    if (!name || !platform) {
      return NextResponse.json({ error: 'name and platform are required' }, { status: 400 });
    }
    const userId = await getSessionUserIdAsync(request);
    const id = createAdCampaign({
      name, platform,
      objective: body.objective, budget: body.budget, targetAudience: body.targetAudience,
      creativeUrl: body.creativeUrl,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      notes: body.notes,
      createdBy: userId ?? undefined,
    });
    logOperationRun({ moduleKey: 'ads_management', operationName: 'manual_create_campaign', executionMode: 'manual', status: 'completed', inputPayload: { id, name, platform }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create ad campaign' }, { status: 500 });
  }
});
