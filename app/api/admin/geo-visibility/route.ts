import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recordObservation, getGeoVisibilitySummary } from '@/lib/geo/geo-visibility';

export const GET = withPermission('geo_visibility', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json(getGeoVisibilitySummary());
});

export const POST = withPermission('geo_visibility', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as {
    engine?: 'chatgpt' | 'perplexity' | 'gemini' | 'copilot' | 'other'; queryText?: string;
    talentshillMentioned?: boolean; mentionPosition?: number; competitorsAlsoMentioned?: string[]; notes?: string;
  } | null;
  if (!body?.engine || !body.queryText || body.talentshillMentioned === undefined) {
    return NextResponse.json({ error: 'engine, queryText, and talentshillMentioned are required' }, { status: 400 });
  }
  try {
    const id = recordObservation({ ...body, engine: body.engine, queryText: body.queryText, talentshillMentioned: body.talentshillMentioned, observedBy: 'admin' });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to record observation' }, { status: 400 });
  }
});
