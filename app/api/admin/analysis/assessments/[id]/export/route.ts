import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentById } from '@/lib/db/analysis-assessment-queries';
import { getFrameworkById } from '@/lib/db/analysis-framework-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessment = getAssessmentById(id);
    if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    const framework = getFrameworkById(assessment.frameworkId);
    const exportData = {
      framework: framework ? { categoryKey: framework.categoryKey, categoryName: framework.categoryName } : null,
      projectName: assessment.projectName,
      status: assessment.status,
      overallScore: assessment.overallScore,
      completedItems: assessment.completedItems,
      totalItems: assessment.totalItems,
      itemScores: JSON.parse(assessment.itemScores as string),
      exportedAt: new Date().toISOString(),
    };
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="assessment-${id}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to export assessment' }, { status: 500 });
  }
}
