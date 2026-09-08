import { NextRequest, NextResponse } from 'next/server';
import { getAssessments, getAssessmentCount, createAssessment } from '@/lib/db/analysis-assessment-queries';
import { getFrameworkById } from '@/lib/db/analysis-framework-queries';
import { CreateAssessmentSchema } from '@/lib/validation/content-schemas';
import { getSessionUserIdAsync } from '@/lib/security/rbac';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const frameworkId = url.searchParams.get('frameworkId') || undefined;
    const projectName = url.searchParams.get('projectName') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const items = getAssessments(offset, limit, { frameworkId, projectName, status });
    const total = getAssessmentCount({ frameworkId, status });
    return NextResponse.json({
      items: items.map((a) => ({ ...a, itemScores: JSON.parse(a.itemScores as string) })),
      total,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try { body = await request.json(); } catch { body = {}; }
    const parsed = CreateAssessmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const framework = getFrameworkById(parsed.data.frameworkId);
    if (!framework) return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
    const userId = await getSessionUserIdAsync(request);
    const id = createAssessment({
      frameworkId: parsed.data.frameworkId,
      projectName: parsed.data.projectName,
      assessorId: userId ?? undefined,
      totalItems: framework.totalItems,
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
  }
}
