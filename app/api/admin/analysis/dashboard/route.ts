import { NextResponse } from 'next/server';
import { getAllFrameworks } from '@/lib/db/analysis-framework-queries';
import { getAssessmentCount, getAssessments } from '@/lib/db/analysis-assessment-queries';

export async function GET() {
  try {
    const frameworks = getAllFrameworks();
    const totalAssessments = getAssessmentCount();
    const inProgress = getAssessmentCount({ status: 'in_progress' });
    const completed = getAssessmentCount({ status: 'completed' });
    const notStarted = getAssessmentCount({ status: 'not_started' });

    const recentAssessments = getAssessments(0, 10);

    return NextResponse.json({
      stats: {
        totalFrameworks: frameworks.length,
        totalAssessments,
        byStatus: { notStarted, inProgress, completed },
      },
      recentAssessments: recentAssessments.map((a) => ({
        ...a,
        itemScores: JSON.parse(a.itemScores as string),
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
