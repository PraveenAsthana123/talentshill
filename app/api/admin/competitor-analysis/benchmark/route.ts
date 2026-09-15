import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recordScore, getHeadToHead, type BenchmarkDimension } from '@/lib/competitor/competitor-benchmark';

// Reuses the 'competitor_analysis' RBAC resource -- this extends that
// module's numeric scoring, not a new admin surface.
export const GET = withPermission('competitor_analysis', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const competitorId = searchParams.get('competitorId');
  if (!competitorId) return NextResponse.json({ error: 'competitorId is required' }, { status: 400 });
  return NextResponse.json({ headToHead: getHeadToHead(competitorId) });
});

export const POST = withPermission('competitor_analysis', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as {
    subjectType?: 'competitor' | 'self'; competitorId?: string; dimension?: BenchmarkDimension; score?: number; notes?: string;
  } | null;
  if (!body?.subjectType || !body.dimension || body.score === undefined) {
    return NextResponse.json({ error: 'subjectType, dimension, and score are required' }, { status: 400 });
  }
  try {
    const id = recordScore({ subjectType: body.subjectType, competitorId: body.competitorId, dimension: body.dimension, score: body.score, notes: body.notes, scoredBy: 'admin' });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to record score' }, { status: 400 });
  }
});
