import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recordAssessment, getAssessments, getAssessmentCoverageSummary, type DimensionScore } from '@/lib/research/assessment-engine';
import { calculateTamSamSom, calculateNps, calculateVanWestendorp, persistCalculation, getCalculations } from '@/lib/research/calculators';

export const GET = withPermission('research_assessment', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const methodologyNum = searchParams.get('methodologyNum');
  if (methodologyNum) {
    const num = parseInt(methodologyNum, 10);
    return NextResponse.json({ assessments: getAssessments(num), calculations: getCalculations(num) });
  }
  return NextResponse.json(getAssessmentCoverageSummary());
});

type Body =
  | { action: 'assess'; methodologyNum: number; subjectName: string; dimensionScores: DimensionScore[] }
  | { action: 'calc_tam_sam_som'; subjectName: string; tamDollars: number; samPercentOfTam: number; somPercentOfSam: number }
  | { action: 'calc_nps'; subjectName: string; promoters: number; passives: number; detractors: number }
  | { action: 'calc_van_westendorp'; subjectName: string; tooCheap: number[]; cheap: number[]; expensive: number[]; tooExpensive: number[] };

export const POST = withPermission('research_assessment', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as Body | null;
  if (!body?.action) return NextResponse.json({ error: 'action is required' }, { status: 400 });

  try {
    if (body.action === 'assess') {
      const id = recordAssessment({ methodologyNum: body.methodologyNum, subjectName: body.subjectName, dimensionScores: body.dimensionScores, assessedBy: 'admin' });
      return NextResponse.json({ id }, { status: 201 });
    }
    if (body.action === 'calc_tam_sam_som') {
      const result = calculateTamSamSom({ tamDollars: body.tamDollars, samPercentOfTam: body.samPercentOfTam, somPercentOfSam: body.somPercentOfSam });
      const id = persistCalculation('tam_sam_som', body.subjectName, body, result, 'admin');
      return NextResponse.json({ id, result }, { status: 201 });
    }
    if (body.action === 'calc_nps') {
      const result = calculateNps({ promoters: body.promoters, passives: body.passives, detractors: body.detractors });
      const id = persistCalculation('nps', body.subjectName, body, { nps: result }, 'admin');
      return NextResponse.json({ id, result }, { status: 201 });
    }
    if (body.action === 'calc_van_westendorp') {
      const result = calculateVanWestendorp({ tooCheap: body.tooCheap, cheap: body.cheap, expensive: body.expensive, tooExpensive: body.tooExpensive });
      const id = persistCalculation('van_westendorp', body.subjectName, body, result, 'admin');
      return NextResponse.json({ id, result }, { status: 201 });
    }
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to process research action' }, { status: 400 });
  }
});
