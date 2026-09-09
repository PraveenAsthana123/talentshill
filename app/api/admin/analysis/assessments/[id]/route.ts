import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentById, updateItemScores, completeAssessment, deleteAssessment } from '@/lib/db/analysis-assessment-queries';
import { UpdateItemScoresSchema } from '@/lib/validation/content-schemas';
import { withPermission, getSessionUserIdAsync } from '@/lib/security/rbac';
import { logOperationRun } from '@/lib/operation-run';

export const GET = withPermission('analysis', 'read')(async (
  _request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
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
});

export const PATCH = withPermission('analysis', 'update')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = await getSessionUserIdAsync(request);

    if (body.action === 'complete') {
      const assessment = getAssessmentById(id);
      if (!assessment) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
      const scores = JSON.parse(assessment.itemScores as string) as { score: number | null }[];
      const scored = scores.filter((s) => s.score !== null && s.score !== undefined);
      const avg = scored.length > 0 ? scored.reduce((sum, s) => sum + (s.score ?? 0), 0) / scored.length : 0;
      const overallScore = Math.round(avg * 100) / 100;
      completeAssessment(id, overallScore);
      logOperationRun({ moduleKey: 'analysis', operationName: 'manual_complete_assessment', executionMode: 'manual', status: 'completed', inputPayload: { id }, outputPayload: { overallScore }, triggeredBy: userId });
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
    logOperationRun({ moduleKey: 'analysis', operationName: 'manual_update_item_scores', executionMode: 'manual', status: 'completed', inputPayload: { id, itemCount: parsed.data.itemScores.length }, outputPayload: { completedItems, overallScore }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
  }
});

export const DELETE = withPermission('analysis', 'delete')(async (
  request: NextRequest,
  context: unknown
) => {
  const { params } = context as { params: Promise<{ id: string }> };
  try {
    const { id } = await params;
    const userId = await getSessionUserIdAsync(request);
    deleteAssessment(id);
    logOperationRun({ moduleKey: 'analysis', operationName: 'manual_delete_assessment', executionMode: 'manual', status: 'completed', inputPayload: { id }, triggeredBy: userId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 });
  }
});
