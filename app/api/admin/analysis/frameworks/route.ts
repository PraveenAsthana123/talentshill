import { NextResponse } from 'next/server';
import { getAllFrameworks } from '@/lib/db/analysis-framework-queries';
import { getAssessmentCount } from '@/lib/db/analysis-assessment-queries';

export async function GET() {
  try {
    const frameworks = getAllFrameworks();
    const items = frameworks.map((fw) => ({
      ...fw,
      analysisTypes: JSON.parse(fw.analysisTypes as string),
      assessmentCount: getAssessmentCount({ frameworkId: fw.id }),
    }));
    return NextResponse.json({ frameworks: items });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch frameworks' }, { status: 500 });
  }
}
