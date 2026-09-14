import { NextRequest, NextResponse } from 'next/server';
import { getAllMarketResearchBriefs, createMarketResearchBrief } from '@/lib/db/market-research-queries';
import { getSessionUserIdAsync, withPermission } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('market_research', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const result = getAllMarketResearchBriefs({ status, limit, offset });
    return NextResponse.json({ items: result.items, total: result.total, offset, limit });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch research briefs' }, { status: 500 });
  }
});

export const POST = withPermission('market_research', 'create')(async (request: NextRequest, _context: unknown) => {
  try {
    const body = await request.json();
    const { title, topic } = body;
    if (!title || !topic) return NextResponse.json({ error: 'title and topic are required' }, { status: 400 });
    const userId = await getSessionUserIdAsync(request);
    const id = createMarketResearchBrief({ title, topic, sourceNotes: body.sourceNotes, findings: body.findings, createdBy: userId ?? undefined });
    logOperationRun({ moduleKey: 'market_research', operationName: 'manual_create_brief', executionMode: 'manual', status: 'completed', inputPayload: { id, title, topic }, triggeredBy: userId });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create research brief' }, { status: 500 });
  }
});
