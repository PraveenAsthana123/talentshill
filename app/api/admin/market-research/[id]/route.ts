import { NextRequest, NextResponse } from 'next/server';
import { getMarketResearchBriefById, updateMarketResearchBrief, deleteMarketResearchBrief } from '@/lib/db/market-research-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('market_research', 'read')(async (_request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const item = getMarketResearchBriefById(id);
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ brief: item });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch research brief' }, { status: 500 });
  }
});

export const PATCH = withPermission('market_research', 'update')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);
    updateMarketResearchBrief(id, body);
    logOperationRun({ moduleKey: 'market_research', operationName: 'manual_update_brief', executionMode: 'manual', status: 'completed', inputPayload: { id, fields: Object.keys(body) }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update research brief' }, { status: 500 });
  }
});

export const DELETE = withPermission('market_research', 'delete')(async (request: NextRequest, context: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    const item = getMarketResearchBriefById(id);
    deleteMarketResearchBrief(id);
    logOperationRun({ moduleKey: 'market_research', operationName: 'manual_delete_brief', executionMode: 'manual', status: 'completed', inputPayload: { id, title: item?.title }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete research brief' }, { status: 500 });
  }
});
