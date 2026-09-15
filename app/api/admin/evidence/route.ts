import { NextRequest, NextResponse } from 'next/server';
import { withPermission } from '@/lib/security/rbac';
import { recordEvidence, listEvidence, getEvidenceSummary, type ClaimClass } from '@/lib/evidence/evidence-ledger';

const VALID_CLASSES: ClaimClass[] = ['fact', 'estimate', 'inference', 'hypothesis', 'unknown'];

export const GET = withPermission('evidence', 'read')(async (request: NextRequest, _context: unknown) => {
  const { searchParams } = new URL(request.url);
  const moduleKey = searchParams.get('moduleKey') || undefined;
  const claimClass = (searchParams.get('claimClass') as ClaimClass | null) || undefined;
  const summary = searchParams.get('summary') === 'true';

  if (summary) {
    return NextResponse.json(getEvidenceSummary(moduleKey));
  }
  const rows = listEvidence({ moduleKey, claimClass, limit: 200 });
  return NextResponse.json({ entries: rows });
});

// Manual admin-entered evidence (e.g. logging an inference/hypothesis that
// isn't produced by any automated pipeline). Automated pipelines call
// recordEvidence() directly (see lib/pipelines/lead-scoring-pipeline.ts).
export const POST = withPermission('evidence', 'create')(async (request: NextRequest, _context: unknown) => {
  const body = await request.json().catch(() => null) as {
    moduleKey?: string; claimClass?: string; claimText?: string; sourceRef?: string;
    sourceTable?: string; confidence?: string;
  } | null;

  if (!body?.moduleKey || !body.claimText || !body.sourceRef) {
    return NextResponse.json({ error: 'moduleKey, claimText, and sourceRef are required' }, { status: 400 });
  }
  if (!body.claimClass || !VALID_CLASSES.includes(body.claimClass as ClaimClass)) {
    return NextResponse.json({ error: `claimClass must be one of: ${VALID_CLASSES.join(', ')}` }, { status: 400 });
  }

  try {
    const id = recordEvidence({
      moduleKey: body.moduleKey,
      claimClass: body.claimClass as ClaimClass,
      claimText: body.claimText,
      sourceRef: body.sourceRef,
      sourceTable: body.sourceTable,
      confidence: body.confidence as 'low' | 'medium' | 'high' | undefined,
      createdBy: 'admin',
    });
    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to record evidence' }, { status: 400 });
  }
});
