import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentById, updateItemScores, completeAssessment, deleteAssessment } from '@/lib/db/analysis-assessment-queries';
import { UpdateItemScoresSchema } from '@/lib/validation/content-schemas';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessment = getAssessmentById(id);
    if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    return NextResponse.json({
      assessment: { ...assessment, itemScores: JSON.parse(assessment.itemScores as string) },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch assessment' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (body.action === 'complete') {
      const assessment = getAssessmentById(id);
      if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      const scores = JSON.parse(assessment.itemScores as string) as { score: number | null }[];
      const scored = scores.filter((s) => s.score !== null && s.score !== undefined);
      const avg = scored.length > 0 ? scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length : 0;
      completeAssessment(id, Math.round(avg * 100) / 100);
      return NextResponse.json({ success: true });
    }

    const parsed = UpdateItemScoresSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });

    // Merge new scores with existing ones (keyed by itemIndex)
    const assessment = getAssessmentById(id);
    if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    const existing = JSON.parse(assessment.itemScores as string) as { itemIndex: number }[];
    const merged = [...existing];
    for (const newItem of parsed.data.itemScores) {
      const idx = merged.findIndex((e) => e.itemIndex === newItem.itemIndex);
      if (idx >= 0) merged[idx] = newItem;
      else merged.push(newItem);
    }
    merged.sort((a, b) => a.itemIndex - b.itemIndex);

    const completedItems = merged.filter((s: any) => s.status === 'completed').length;
    const scored = merged.filter((s: any) => s.score !== null && s.score !== undefined);
    const overallScore = scored.length > 0 ? Math.round(scored.reduce((sum: number, s: any) => sum + (s.score ?? 0), 0) / scored.length * 100) / 100 : null;
    updateItemScores(id, merged, completedItems, overallScore);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    deleteAssessment(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 });
  }
}
