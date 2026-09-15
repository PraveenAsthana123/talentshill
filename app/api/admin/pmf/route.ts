import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recordPmfResponse, getPmfSummary } from '@/lib/pmf/pmf-tracking';

type PmfFeeling = 'very_disappointed' | 'somewhat_disappointed' | 'not_disappointed';

export const GET = withPermission('pmf', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json(getPmfSummary());
});

export const POST = withPermission('pmf', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { respondentEmail?: string; howWouldYouFeel?: string; mainBenefit?: string; whoWouldBenefit?: string } | null;
  if (!body?.respondentEmail || !body.howWouldYouFeel) return NextResponse.json({ error: 'respondentEmail and howWouldYouFeel are required' }, { status: 400 });
  try {
    const id = recordPmfResponse({ ...body, respondentEmail: body.respondentEmail, howWouldYouFeel: body.howWouldYouFeel as PmfFeeling });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to record response' }, { status: 400 });
  }
});
