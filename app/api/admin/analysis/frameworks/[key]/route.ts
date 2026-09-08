import { NextRequest, NextResponse } from 'next/server';
import { getFrameworkByKey } from '@/lib/db/analysis-framework-queries';
import { getAssessmentsByFramework } from '@/lib/db/analysis-assessment-queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const framework = getFrameworkByKey(key);
    if (!framework) return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
    const assessments = getAssessmentsByFramework(framework.id);
    return NextResponse.json({
      framework: { ...framework, analysisTypes: JSON.parse(framework.analysisTypes as string) },
      assessments: assessments.map((a) => ({ ...a, itemScores: JSON.parse(a.itemScores as string) })),
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch framework' }, { status: 500 });
  }
}
