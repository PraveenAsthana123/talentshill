import { NextRequest, NextResponse } from 'next/server';
import { db, schema } from '@/lib/db/index';
import { eq } from 'drizzle-orm';
import { getAllFrameworks } from '@/lib/db/analysis-framework-queries';
import { getAssessmentCount, getAssessments } from '@/lib/db/analysis-assessment-queries';
import { withPermission } from '@/lib/security/rbac';

export const GET = withPermission('analysis', 'read')(async (_request: NextRequest, _context: unknown) => {
  try {
    const frameworks = getAllFrameworks();
    const totalAssessments = getAssessmentCount();
    const inProgress = getAssessmentCount({ status: 'in_progress' });
    const completed = getAssessmentCount({ status: 'completed' });
    const notStarted = getAssessmentCount({ status: 'not_started' });

    const recentAssessments = getAssessments(0, 10);

    const allAssessments = getAssessments(0, 10000);
    const scored = allAssessments.filter((a) => a.healthScore !== null && a.healthScore !== undefined);
    const avgHealthScore = scored.length > 0 ? Math.round(scored.reduce((s, a) => s + (a.healthScore || 0), 0) / scored.length) : 0;
    const totalRuns = db.select().from(schema.operationRun).where(eq(schema.operationRun.moduleKey, 'analysis')).all().length;

    return NextResponse.json({
      stats: {
        totalFrameworks: frameworks.length,
        totalAssessments,
        byStatus: { notStarted, inProgress, completed },
        avgHealthScore,
        unscoredHealth: allAssessments.length - scored.length,
        totalRuns,
      },
      recentAssessments: recentAssessments.map((a) => ({
        ...a,
        itemScores: JSON.parse(a.itemScores as string),
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
});
