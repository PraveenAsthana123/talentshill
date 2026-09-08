import { NextRequest, NextResponse } from 'next/server';
import { getSurveyStats, getAllResponses } from '@/lib/db/survey-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('survey', 'read')(async (request: NextRequest, _context: unknown) => {
  try {
    const { searchParams } = new URL(request.url);
    const stats = searchParams.get('stats') === 'true';

    if (stats) {
      const data = getSurveyStats();
      return NextResponse.json({ stats: data });
    }

    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const maturityLevel = searchParams.get('level') || undefined;
    const industry = searchParams.get('industry') || undefined;

    const result = getAllResponses({
      offset,
      limit,
      maturityLevel: maturityLevel as 'beginner' | 'developing' | 'advanced' | 'leader' | undefined,
      industry,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch survey data' }, { status: 500 });
  }
});
