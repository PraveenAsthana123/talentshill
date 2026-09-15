import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { createCaseStudy, publishCaseStudy, getCaseStudies } from '@/lib/casestudy/case-study';

export const GET = withPermission('case_studies', 'read')(async (_request: NextRequest, _context: unknown) => {
  return NextResponse.json({ caseStudies: getCaseStudies() });
});

export const POST = withPermission('case_studies', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { title?: string; clientContext?: string; challenge?: string; solutionText?: string; outcome?: string; evidenceId?: string } | null;
  if (!body?.title || !body.clientContext || !body.challenge || !body.solutionText || !body.outcome) {
    return NextResponse.json({ error: 'title, clientContext, challenge, solutionText, and outcome are required' }, { status: 400 });
  }
  try {
    const id = createCaseStudy({ ...body, title: body.title, clientContext: body.clientContext, challenge: body.challenge, solutionText: body.solutionText, outcome: body.outcome, createdBy: 'admin' });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create case study (evidenceId must reference a real evidence_record row)' }, { status: 400 });
  }
});

export const PATCH = withPermission('case_studies', 'update')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  const result = publishCaseStudy(body.id);
  return NextResponse.json(result, { status: result.published ? 200 : 400 });
});
